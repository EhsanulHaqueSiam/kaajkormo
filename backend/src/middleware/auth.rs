use axum::{
    extract::{FromRequestParts, Request},
    http::request::Parts,
    middleware::Next,
    response::Response,
};
use jsonwebtoken::{decode, decode_header, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::error::AppError;

/// Claims from Clerk JWT
#[derive(Debug, Serialize, Deserialize)]
pub struct ClerkClaims {
    pub sub: String, // Clerk user ID (e.g. "user_2x...")
    pub exp: usize,
    pub iat: usize,
    pub iss: Option<String>,
    pub azp: Option<String>,
    pub email: Option<String>,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub full_name: Option<String>,
    pub image_url: Option<String>,
}

/// Authenticated user extracted from Clerk JWT + local DB
#[derive(Debug, Clone)]
pub struct AuthUser {
    pub user_id: uuid::Uuid,
    pub clerk_id: String,
    pub role: String,
}

/// Cached JWKS keys
#[derive(Clone)]
pub struct JwksCache {
    pub keys: Arc<RwLock<Vec<JwkKey>>>,
    pub jwks_url: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct JwkKey {
    pub kid: String,
    pub kty: String,
    pub n: String,
    pub e: String,
    #[serde(default)]
    pub alg: Option<String>,
}

#[derive(Debug, Deserialize)]
struct JwksResponse {
    keys: Vec<JwkKey>,
}

impl JwksCache {
    pub fn new(jwks_url: String) -> Self {
        Self {
            keys: Arc::new(RwLock::new(Vec::new())),
            jwks_url,
        }
    }

    pub async fn fetch_keys(&self) -> Result<(), AppError> {
        let resp = reqwest::get(&self.jwks_url)
            .await
            .map_err(|e| AppError::Internal(format!("Failed to fetch JWKS: {e}")))?;

        let jwks: JwksResponse = resp
            .json()
            .await
            .map_err(|e| AppError::Internal(format!("Failed to parse JWKS: {e}")))?;

        let mut keys = self.keys.write().await;
        *keys = jwks.keys;
        Ok(())
    }

    pub async fn get_key(&self, kid: &str) -> Result<JwkKey, AppError> {
        // Try cached keys first
        {
            let keys = self.keys.read().await;
            if let Some(key) = keys.iter().find(|k| k.kid == kid) {
                return Ok(key.clone());
            }
        }

        // Refresh and retry
        self.fetch_keys().await?;

        let keys = self.keys.read().await;
        keys.iter()
            .find(|k| k.kid == kid)
            .cloned()
            .ok_or_else(|| AppError::Unauthorized("No matching JWKS key found".into()))
    }
}

/// Verify a Clerk JWT and return the claims
pub async fn verify_clerk_token(
    token: &str,
    jwks_cache: &JwksCache,
    issuer: &str,
) -> Result<ClerkClaims, AppError> {
    let header = decode_header(token)
        .map_err(|e| AppError::Unauthorized(format!("Invalid token header: {e}")))?;

    let kid = header
        .kid
        .ok_or_else(|| AppError::Unauthorized("Token missing kid header".into()))?;

    let jwk = jwks_cache.get_key(&kid).await?;

    let decoding_key = DecodingKey::from_rsa_components(&jwk.n, &jwk.e)
        .map_err(|e| AppError::Internal(format!("Invalid RSA key: {e}")))?;

    let mut validation = Validation::new(Algorithm::RS256);
    validation.set_issuer(&[issuer]);
    validation.validate_exp = true;

    let token_data = decode::<ClerkClaims>(token, &decoding_key, &validation)
        .map_err(|e| AppError::Unauthorized(format!("Token validation failed: {e}")))?;

    Ok(token_data.claims)
}

impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        // Get auth user from extensions (set by the auth middleware layer)
        parts
            .extensions
            .get::<AuthUser>()
            .cloned()
            .ok_or_else(|| AppError::Unauthorized("Authentication required".into()))
    }
}

/// Middleware that injects config and optionally resolves the authenticated user.
/// If no auth header is present, the request continues without an AuthUser.
/// If an auth header is present but invalid, returns 401.
pub async fn auth_middleware(
    axum::extract::State(state): axum::extract::State<crate::AppState>,
    mut request: Request,
    next: Next,
) -> Result<Response, AppError> {
    // Always inject config
    request.extensions_mut().insert(state.config.clone());

    let auth_header = request
        .headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    if let Some(auth_header) = auth_header {
        let token = auth_header
            .strip_prefix("Bearer ")
            .ok_or_else(|| AppError::Unauthorized("Invalid authorization format".into()))?;

        let claims =
            verify_clerk_token(token, &state.jwks_cache, &state.config.clerk_issuer).await?;

        // Upsert user in local DB (get-or-create by clerk_id)
        let user = sqlx::query_as::<_, crate::models::user::User>(
            r#"INSERT INTO users (clerk_id, email, full_name, role)
               VALUES ($1, COALESCE($2, ''), COALESCE($3, 'User'), 'candidate')
               ON CONFLICT (clerk_id) DO UPDATE SET
                   email = COALESCE(NULLIF($2, ''), users.email),
                   full_name = COALESCE(NULLIF($3, ''), users.full_name),
                   avatar_url = COALESCE($4, users.avatar_url),
                   updated_at = NOW()
               RETURNING *"#,
        )
        .bind(&claims.sub)
        .bind(&claims.email.unwrap_or_default())
        .bind(&claims.full_name.unwrap_or_default())
        .bind(&claims.image_url)
        .fetch_one(&state.db)
        .await
        .map_err(|e| {
            tracing::error!("Failed to upsert user for clerk_id={}: {e}", claims.sub);
            AppError::Internal("Failed to resolve user".into())
        })?;

        request.extensions_mut().insert(AuthUser {
            user_id: user.id,
            clerk_id: claims.sub,
            role: user.role.clone(),
        });
    }

    Ok(next.run(request).await)
}

pub fn require_role(user: &AuthUser, required: &str) -> Result<(), AppError> {
    if user.role != required && user.role != "admin" {
        return Err(AppError::Forbidden(format!("Requires role: {required}")));
    }
    Ok(())
}
