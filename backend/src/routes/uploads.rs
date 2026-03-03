use axum::extract::{Multipart, State};
use axum::Json;

use crate::error::AppError;
use crate::middleware::auth::AuthUser;
use crate::services::file_upload::save_upload;
use crate::AppState;

pub async fn upload_resume(
    State(state): State<AppState>,
    _auth_user: AuthUser,
    mut multipart: Multipart,
) -> Result<Json<serde_json::Value>, AppError> {
    let field = multipart
        .next_field()
        .await
        .map_err(|e| AppError::BadRequest(format!("Invalid multipart: {e}")))?
        .ok_or_else(|| AppError::BadRequest("No file provided".into()))?;

    let url = save_upload(
        field,
        &["application/pdf"],
        10 * 1024 * 1024, // 10 MB
        &state.config.upload_dir,
        "resumes",
    )
    .await?;

    Ok(Json(serde_json::json!({ "url": url })))
}

pub async fn upload_photo(
    State(state): State<AppState>,
    _auth_user: AuthUser,
    mut multipart: Multipart,
) -> Result<Json<serde_json::Value>, AppError> {
    let field = multipart
        .next_field()
        .await
        .map_err(|e| AppError::BadRequest(format!("Invalid multipart: {e}")))?
        .ok_or_else(|| AppError::BadRequest("No file provided".into()))?;

    let url = save_upload(
        field,
        &["image/jpeg", "image/png", "image/webp"],
        5 * 1024 * 1024, // 5 MB
        &state.config.upload_dir,
        "photos",
    )
    .await?;

    Ok(Json(serde_json::json!({ "url": url })))
}

pub async fn upload_logo(
    State(state): State<AppState>,
    _auth_user: AuthUser,
    mut multipart: Multipart,
) -> Result<Json<serde_json::Value>, AppError> {
    let field = multipart
        .next_field()
        .await
        .map_err(|e| AppError::BadRequest(format!("Invalid multipart: {e}")))?
        .ok_or_else(|| AppError::BadRequest("No file provided".into()))?;

    let url = save_upload(
        field,
        &["image/jpeg", "image/png", "image/webp"],
        5 * 1024 * 1024, // 5 MB
        &state.config.upload_dir,
        "logos",
    )
    .await?;

    Ok(Json(serde_json::json!({ "url": url })))
}
