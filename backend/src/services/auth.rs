// Auth is now handled by Clerk. This module provides helper utilities.

use crate::error::AppError;

/// Update user role (admin operation)
pub async fn set_user_role(
    db: &sqlx::PgPool,
    user_id: uuid::Uuid,
    role: &str,
) -> Result<(), AppError> {
    if !["candidate", "employer", "admin"].contains(&role) {
        return Err(AppError::BadRequest(format!("Invalid role: {role}")));
    }

    sqlx::query("UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2")
        .bind(role)
        .bind(user_id)
        .execute(db)
        .await?;

    Ok(())
}
