use axum::{
    Json,
    extract::{Path, State},
};
use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;
use uuid::Uuid;

use crate::AppState;
use crate::error::AppError;
use crate::middleware::auth::AuthUser;

#[derive(Debug, Serialize, FromRow)]
pub struct SavedJob {
    pub id: Uuid,
    pub user_id: Uuid,
    pub job_id: Uuid,
    pub created_at: DateTime<Utc>,
}

pub async fn list_saved_jobs(
    State(state): State<AppState>,
    auth_user: AuthUser,
) -> Result<Json<Vec<SavedJob>>, AppError> {
    let saved = sqlx::query_as::<_, SavedJob>(
        "SELECT * FROM saved_jobs WHERE user_id = $1 ORDER BY created_at DESC",
    )
    .bind(auth_user.user_id)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(saved))
}

pub async fn save_job(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Path(job_id): Path<Uuid>,
) -> Result<Json<SavedJob>, AppError> {
    let saved = sqlx::query_as::<_, SavedJob>(
        r"INSERT INTO saved_jobs (user_id, job_id)
           VALUES ($1, $2)
           ON CONFLICT (user_id, job_id) DO UPDATE SET user_id = $1
           RETURNING *",
    )
    .bind(auth_user.user_id)
    .bind(job_id)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(saved))
}

pub async fn unsave_job(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Path(job_id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    sqlx::query("DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2")
        .bind(auth_user.user_id)
        .bind(job_id)
        .execute(&state.db)
        .await?;

    Ok(Json(serde_json::json!({"message": "Job unsaved"})))
}
