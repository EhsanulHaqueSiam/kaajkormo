use axum::Json;
use axum::extract::{Path, State};
use uuid::Uuid;

use crate::AppState;
use crate::error::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::job_alert::{CreateJobAlert, JobAlert, UpdateJobAlert};

pub async fn create_alert(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Json(body): Json<CreateJobAlert>,
) -> Result<Json<JobAlert>, AppError> {
    let alert = sqlx::query_as::<_, JobAlert>(
        r#"INSERT INTO job_alerts (user_id, name, criteria, frequency)
           VALUES ($1, $2, $3, $4)
           RETURNING *"#,
    )
    .bind(auth_user.user_id)
    .bind(&body.name)
    .bind(&body.criteria)
    .bind(body.frequency.as_deref().unwrap_or("daily"))
    .fetch_one(&state.db)
    .await?;

    Ok(Json(alert))
}

pub async fn list_alerts(
    State(state): State<AppState>,
    auth_user: AuthUser,
) -> Result<Json<Vec<JobAlert>>, AppError> {
    let alerts = sqlx::query_as::<_, JobAlert>(
        "SELECT * FROM job_alerts WHERE user_id = $1 ORDER BY created_at DESC",
    )
    .bind(auth_user.user_id)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(alerts))
}

pub async fn update_alert(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateJobAlert>,
) -> Result<Json<JobAlert>, AppError> {
    let existing =
        sqlx::query_as::<_, JobAlert>("SELECT * FROM job_alerts WHERE id = $1 AND user_id = $2")
            .bind(id)
            .bind(auth_user.user_id)
            .fetch_optional(&state.db)
            .await?
            .ok_or_else(|| AppError::NotFound("Job alert not found".into()))?;

    let alert = sqlx::query_as::<_, JobAlert>(
        r#"UPDATE job_alerts SET
               name = COALESCE($1, name),
               criteria = COALESCE($2, criteria),
               frequency = COALESCE($3, frequency),
               is_active = COALESCE($4, is_active),
               updated_at = NOW()
           WHERE id = $5
           RETURNING *"#,
    )
    .bind(&body.name)
    .bind(&body.criteria)
    .bind(&body.frequency)
    .bind(body.is_active)
    .bind(existing.id)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(alert))
}

pub async fn delete_alert(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let result = sqlx::query("DELETE FROM job_alerts WHERE id = $1 AND user_id = $2")
        .bind(id)
        .bind(auth_user.user_id)
        .execute(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Job alert not found".into()));
    }

    Ok(Json(serde_json::json!({"message": "Alert deleted"})))
}
