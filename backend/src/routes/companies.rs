use axum::{
    Json,
    extract::{Path, State},
};
use uuid::Uuid;

use crate::AppState;
use crate::error::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::company::{Company, UpdateCompany};

pub async fn get_own_company(
    State(state): State<AppState>,
    auth_user: AuthUser,
) -> Result<Json<Company>, AppError> {
    crate::middleware::auth::require_role(&auth_user, "employer")?;

    let company = sqlx::query_as::<_, Company>("SELECT * FROM companies WHERE owner_id = $1")
        .bind(auth_user.user_id)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("Company not found".into()))?;

    Ok(Json(company))
}

pub async fn update_company(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Json(body): Json<UpdateCompany>,
) -> Result<Json<Company>, AppError> {
    crate::middleware::auth::require_role(&auth_user, "employer")?;

    // Check if company exists, create if not
    let existing = sqlx::query_as::<_, Company>("SELECT * FROM companies WHERE owner_id = $1")
        .bind(auth_user.user_id)
        .fetch_optional(&state.db)
        .await?;

    let company = if let Some(_existing) = existing {
        sqlx::query_as::<_, Company>(
            r#"UPDATE companies SET
                name = COALESCE($1, name),
                description = COALESCE($2, description),
                logo_url = COALESCE($3, logo_url),
                website = COALESCE($4, website),
                industry = COALESCE($5, industry),
                company_size = COALESCE($6, company_size),
                location = COALESCE($7, location),
                updated_at = NOW()
               WHERE owner_id = $8
               RETURNING *"#,
        )
        .bind(&body.name)
        .bind(&body.description)
        .bind(&body.logo_url)
        .bind(&body.website)
        .bind(&body.industry)
        .bind(&body.company_size)
        .bind(&body.location)
        .bind(auth_user.user_id)
        .fetch_one(&state.db)
        .await?
    } else {
        let name = body.name.as_deref().unwrap_or("My Company");
        sqlx::query_as::<_, Company>(
            r#"INSERT INTO companies (owner_id, name, description, logo_url, website, industry, company_size, location)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
               RETURNING *"#,
        )
        .bind(auth_user.user_id)
        .bind(name)
        .bind(&body.description)
        .bind(&body.logo_url)
        .bind(&body.website)
        .bind(&body.industry)
        .bind(&body.company_size)
        .bind(&body.location)
        .fetch_one(&state.db)
        .await?
    };

    Ok(Json(company))
}

pub async fn get_company(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<Company>, AppError> {
    let company = sqlx::query_as::<_, Company>("SELECT * FROM companies WHERE id = $1")
        .bind(id)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("Company not found".into()))?;

    Ok(Json(company))
}
