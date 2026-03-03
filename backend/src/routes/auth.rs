use axum::{Json, extract::State};
use serde::Deserialize;
use serde_json::{Value, json};

use crate::AppState;
use crate::error::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::user::UserPublic;

/// GET /api/auth/me - Returns the current authenticated user
pub async fn me(
    State(state): State<AppState>,
    auth_user: AuthUser,
) -> Result<Json<UserPublic>, AppError> {
    let user = sqlx::query_as::<_, crate::models::user::User>("SELECT * FROM users WHERE id = $1")
        .bind(auth_user.user_id)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("User not found".into()))?;

    Ok(Json(UserPublic::from(user)))
}

#[derive(Debug, Deserialize)]
pub struct SetRoleRequest {
    pub role: String,
}

/// POST /api/auth/set-role - Set user role (only allowed once, or by admin)
/// New users default to 'candidate'. This lets them choose 'employer' during onboarding.
pub async fn set_role(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Json(body): Json<SetRoleRequest>,
) -> Result<Json<Value>, AppError> {
    if !["candidate", "employer"].contains(&body.role.as_str()) {
        return Err(AppError::BadRequest(
            "Role must be 'candidate' or 'employer'".into(),
        ));
    }

    crate::services::auth::set_user_role(&state.db, auth_user.user_id, &body.role).await?;

    Ok(Json(
        json!({ "message": "Role updated", "role": body.role }),
    ))
}
