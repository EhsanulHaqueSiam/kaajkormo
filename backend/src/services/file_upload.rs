use axum::extract::multipart::Field;
use tokio::io::AsyncWriteExt;
use uuid::Uuid;

use crate::error::AppError;

pub async fn save_upload(
    field: Field<'_>,
    allowed_types: &[&str],
    max_size: usize,
    upload_dir: &str,
    subfolder: &str,
) -> Result<String, AppError> {
    let content_type = field
        .content_type()
        .unwrap_or("application/octet-stream")
        .to_string();

    if !allowed_types.iter().any(|t| content_type.contains(t)) {
        return Err(AppError::BadRequest(format!(
            "Invalid file type: {content_type}. Allowed: {allowed_types:?}"
        )));
    }

    let original_name = field.file_name().unwrap_or("upload").to_string();

    let ext = original_name.rsplit('.').next().unwrap_or("bin");

    let bytes = field
        .bytes()
        .await
        .map_err(|e| AppError::BadRequest(format!("Failed to read upload: {e}")))?;

    if bytes.len() > max_size {
        return Err(AppError::BadRequest(format!(
            "File too large. Maximum size: {} MB",
            max_size / (1024 * 1024)
        )));
    }

    let dir = format!("{upload_dir}/{subfolder}");
    tokio::fs::create_dir_all(&dir)
        .await
        .map_err(|e| AppError::Internal(format!("Failed to create upload dir: {e}")))?;

    let filename = format!("{}.{ext}", Uuid::new_v4());
    let filepath = format!("{dir}/{filename}");

    let mut file = tokio::fs::File::create(&filepath)
        .await
        .map_err(|e| AppError::Internal(format!("Failed to create file: {e}")))?;

    file.write_all(&bytes)
        .await
        .map_err(|e| AppError::Internal(format!("Failed to write file: {e}")))?;

    Ok(format!("/uploads/{subfolder}/{filename}"))
}
