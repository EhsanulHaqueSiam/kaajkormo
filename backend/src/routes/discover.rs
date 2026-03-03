use axum::Json;
use axum::extract::State;
use serde::Deserialize;
use uuid::Uuid;

use crate::AppState;
use crate::error::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::job::Job;
use crate::models::swipe_history::SwipeHistory;

pub async fn discover_jobs(
    State(state): State<AppState>,
    auth_user: AuthUser,
) -> Result<Json<Vec<Job>>, AppError> {
    crate::middleware::auth::require_role(&auth_user, "candidate")?;

    // Get candidate skills for matching
    let candidate_skills: Option<serde_json::Value> =
        sqlx::query_scalar("SELECT skills FROM candidate_profiles WHERE user_id = $1")
            .bind(auth_user.user_id)
            .fetch_optional(&state.db)
            .await?;

    // Fetch jobs not already swiped on, ordered by creation date
    // If we have candidate skills, we could do JSONB overlap matching,
    // but for simplicity we order by recency
    let jobs = if candidate_skills.is_some() {
        sqlx::query_as::<_, Job>(
            r#"SELECT j.* FROM jobs j
               WHERE j.status = 'active'
               AND j.id NOT IN (SELECT job_id FROM swipe_history WHERE user_id = $1)
               ORDER BY j.created_at DESC
               LIMIT 20"#,
        )
        .bind(auth_user.user_id)
        .fetch_all(&state.db)
        .await?
    } else {
        sqlx::query_as::<_, Job>(
            r#"SELECT j.* FROM jobs j
               WHERE j.status = 'active'
               AND j.id NOT IN (SELECT job_id FROM swipe_history WHERE user_id = $1)
               ORDER BY j.created_at DESC
               LIMIT 20"#,
        )
        .bind(auth_user.user_id)
        .fetch_all(&state.db)
        .await?
    };

    Ok(Json(jobs))
}

#[derive(Debug, Deserialize)]
pub struct SwipeAction {
    pub job_id: Uuid,
    pub action: String,
}

pub async fn swipe(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Json(body): Json<SwipeAction>,
) -> Result<Json<SwipeHistory>, AppError> {
    crate::middleware::auth::require_role(&auth_user, "candidate")?;

    if !["apply", "skip", "save"].contains(&body.action.as_str()) {
        return Err(AppError::BadRequest(
            "Invalid action. Must be: apply, skip, or save".into(),
        ));
    }

    let swipe = sqlx::query_as::<_, SwipeHistory>(
        r#"INSERT INTO swipe_history (user_id, job_id, action)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, job_id) DO UPDATE SET action = $3, created_at = NOW()
           RETURNING *"#,
    )
    .bind(auth_user.user_id)
    .bind(body.job_id)
    .bind(&body.action)
    .fetch_one(&state.db)
    .await?;

    // Side effects based on action
    if body.action == "apply" {
        sqlx::query(
            r#"INSERT INTO applications (job_id, candidate_id)
               VALUES ($1, $2)
               ON CONFLICT (job_id, candidate_id) DO NOTHING"#,
        )
        .bind(body.job_id)
        .bind(auth_user.user_id)
        .execute(&state.db)
        .await?;
    } else if body.action == "save" {
        sqlx::query(
            r#"INSERT INTO saved_jobs (user_id, job_id)
               VALUES ($1, $2)
               ON CONFLICT (user_id, job_id) DO NOTHING"#,
        )
        .bind(auth_user.user_id)
        .bind(body.job_id)
        .execute(&state.db)
        .await?;
    }

    Ok(Json(swipe))
}

pub async fn undo_swipe(
    State(state): State<AppState>,
    auth_user: AuthUser,
) -> Result<Json<serde_json::Value>, AppError> {
    crate::middleware::auth::require_role(&auth_user, "candidate")?;

    // Get the most recent swipe
    let last_swipe = sqlx::query_as::<_, SwipeHistory>(
        "SELECT * FROM swipe_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
    )
    .bind(auth_user.user_id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("No swipe to undo".into()))?;

    // Undo side effects
    if last_swipe.action == "apply" {
        sqlx::query("DELETE FROM applications WHERE job_id = $1 AND candidate_id = $2")
            .bind(last_swipe.job_id)
            .bind(auth_user.user_id)
            .execute(&state.db)
            .await?;
    } else if last_swipe.action == "save" {
        sqlx::query("DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2")
            .bind(auth_user.user_id)
            .bind(last_swipe.job_id)
            .execute(&state.db)
            .await?;
    }

    // Delete the swipe record
    sqlx::query("DELETE FROM swipe_history WHERE id = $1")
        .bind(last_swipe.id)
        .execute(&state.db)
        .await?;

    Ok(Json(
        serde_json::json!({"message": "Swipe undone", "job_id": last_swipe.job_id}),
    ))
}
