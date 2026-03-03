use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::notification::Notification;

pub async fn create_notification(
    db: &PgPool,
    user_id: Uuid,
    notification_type: &str,
    title: &str,
    body: Option<&str>,
    data: Option<serde_json::Value>,
) -> Result<Notification, AppError> {
    let notification = sqlx::query_as::<_, Notification>(
        r#"INSERT INTO notifications (user_id, notification_type, title, body, data)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *"#,
    )
    .bind(user_id)
    .bind(notification_type)
    .bind(title)
    .bind(body)
    .bind(data)
    .fetch_one(db)
    .await?;

    Ok(notification)
}

pub async fn mark_read(db: &PgPool, notification_id: Uuid, user_id: Uuid) -> Result<(), AppError> {
    let result =
        sqlx::query("UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2")
            .bind(notification_id)
            .bind(user_id)
            .execute(db)
            .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Notification not found".into()));
    }

    Ok(())
}

pub async fn mark_all_read(db: &PgPool, user_id: Uuid) -> Result<(), AppError> {
    sqlx::query("UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false")
        .bind(user_id)
        .execute(db)
        .await?;

    Ok(())
}
