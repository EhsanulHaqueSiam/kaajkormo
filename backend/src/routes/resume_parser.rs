use axum::Json;
use axum::extract::{Multipart, State};

use crate::AppState;
use crate::error::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::resume_parse::ParsedResume;
use crate::services::resume_parser::parse_pdf;

pub async fn parse_resume(
    State(state): State<AppState>,
    auth_user: AuthUser,
    mut multipart: Multipart,
) -> Result<Json<ParsedResume>, AppError> {
    let field = multipart
        .next_field()
        .await
        .map_err(|e| AppError::BadRequest(format!("Invalid multipart: {e}")))?
        .ok_or_else(|| AppError::BadRequest("No file provided".into()))?;

    let original_filename = field.file_name().unwrap_or("resume.pdf").to_string();

    let bytes = field
        .bytes()
        .await
        .map_err(|e| AppError::BadRequest(format!("Failed to read file: {e}")))?;

    let parsed = parse_pdf(&bytes)?;

    // Save parse result to DB
    let parsed_data = serde_json::to_value(&parsed)
        .map_err(|e| AppError::Internal(format!("Failed to serialize: {e}")))?;

    sqlx::query(
        r#"INSERT INTO resume_parses (user_id, original_filename, file_url, parsed_data)
           VALUES ($1, $2, $3, $4)"#,
    )
    .bind(auth_user.user_id)
    .bind(&original_filename)
    .bind("") // no file_url for direct parse
    .bind(&parsed_data)
    .execute(&state.db)
    .await?;

    Ok(Json(parsed))
}
