use axum::Json;
use axum::extract::{Path, State};
use serde::Serialize;
use uuid::Uuid;

use crate::AppState;
use crate::error::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::notification::Notification;

pub async fn list_notifications(
    State(state): State<AppState>,
    auth_user: AuthUser,
) -> Result<Json<Vec<Notification>>, AppError> {
    let notifications = sqlx::query_as::<_, Notification>(
        r"SELECT * FROM notifications
           WHERE user_id = $1
           ORDER BY is_read ASC, created_at DESC
           LIMIT 50",
    )
    .bind(auth_user.user_id)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(notifications))
}

pub async fn mark_read(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    crate::services::notifications::mark_read(&state.db, id, auth_user.user_id).await?;
    Ok(Json(serde_json::json!({"message": "Marked as read"})))
}

pub async fn mark_all_read(
    State(state): State<AppState>,
    auth_user: AuthUser,
) -> Result<Json<serde_json::Value>, AppError> {
    crate::services::notifications::mark_all_read(&state.db, auth_user.user_id).await?;
    Ok(Json(serde_json::json!({"message": "All marked as read"})))
}

#[derive(Debug, Serialize)]
pub struct UnreadCount {
    pub count: i64,
}

pub async fn unread_count(
    State(state): State<AppState>,
    auth_user: AuthUser,
) -> Result<Json<UnreadCount>, AppError> {
    let count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false",
    )
    .bind(auth_user.user_id)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(UnreadCount { count }))
}
