use axum::Json;
use axum::extract::{Path, State};
use uuid::Uuid;

use crate::AppState;
use crate::error::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::application::Application;
use crate::models::interview::{CreateInterview, Interview, UpdateInterview};

pub async fn create_interview(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Json(body): Json<CreateInterview>,
) -> Result<Json<Interview>, AppError> {
    crate::middleware::auth::require_role(&auth_user, "employer")?;

    // Verify the employer owns the job for this application
    let app = sqlx::query_as::<_, Application>("SELECT * FROM applications WHERE id = $1")
        .bind(body.application_id)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("Application not found".into()))?;

    let job = sqlx::query_as::<_, crate::models::job::Job>("SELECT * FROM jobs WHERE id = $1")
        .bind(app.job_id)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("Job not found".into()))?;

    if job.posted_by != auth_user.user_id {
        return Err(AppError::Forbidden("Not your job posting".into()));
    }

    let interview = sqlx::query_as::<_, Interview>(
        r#"INSERT INTO interviews (application_id, scheduled_at, duration_minutes, interview_type, location, meeting_url, notes, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *"#,
    )
    .bind(body.application_id)
    .bind(body.scheduled_at)
    .bind(body.duration_minutes.unwrap_or(60))
    .bind(&body.interview_type)
    .bind(&body.location)
    .bind(&body.meeting_url)
    .bind(&body.notes)
    .bind(auth_user.user_id)
    .fetch_one(&state.db)
    .await?;

    // Create notification for the candidate
    crate::services::notifications::create_notification(
        &state.db,
        app.candidate_id,
        "interview_scheduled",
        &format!("Interview scheduled for {}", job.title),
        Some(&format!(
            "{} interview on {}",
            body.interview_type,
            body.scheduled_at.format("%B %d, %Y at %H:%M UTC")
        )),
        Some(serde_json::json!({
            "interview_id": interview.id,
            "application_id": body.application_id,
            "job_id": job.id,
        })),
    )
    .await?;

    // Send email to candidate
    let candidate_email: Option<String> =
        sqlx::query_scalar("SELECT email FROM users WHERE id = $1")
            .bind(app.candidate_id)
            .fetch_optional(&state.db)
            .await?;

    if let Some(email) = candidate_email {
        if !email.is_empty() {
            let _ = state
                .email_service
                .send_interview_scheduled(
                    &email,
                    &job.title,
                    &body
                        .scheduled_at
                        .format("%B %d, %Y at %H:%M UTC")
                        .to_string(),
                    &body.interview_type,
                )
                .await;
        }
    }

    Ok(Json(interview))
}

pub async fn list_interviews(
    State(state): State<AppState>,
    auth_user: AuthUser,
) -> Result<Json<Vec<Interview>>, AppError> {
    let interviews = if auth_user.role == "employer" {
        sqlx::query_as::<_, Interview>(
            r#"SELECT i.* FROM interviews i
               JOIN applications a ON i.application_id = a.id
               JOIN jobs j ON a.job_id = j.id
               WHERE j.posted_by = $1
               ORDER BY i.scheduled_at ASC"#,
        )
        .bind(auth_user.user_id)
        .fetch_all(&state.db)
        .await?
    } else {
        sqlx::query_as::<_, Interview>(
            r#"SELECT i.* FROM interviews i
               JOIN applications a ON i.application_id = a.id
               WHERE a.candidate_id = $1
               ORDER BY i.scheduled_at ASC"#,
        )
        .bind(auth_user.user_id)
        .fetch_all(&state.db)
        .await?
    };

    Ok(Json(interviews))
}

pub async fn update_interview(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateInterview>,
) -> Result<Json<Interview>, AppError> {
    crate::middleware::auth::require_role(&auth_user, "employer")?;

    // Verify ownership
    let existing = sqlx::query_as::<_, Interview>("SELECT * FROM interviews WHERE id = $1")
        .bind(id)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("Interview not found".into()))?;

    if existing.created_by != auth_user.user_id {
        return Err(AppError::Forbidden("Not your interview".into()));
    }

    let interview = sqlx::query_as::<_, Interview>(
        r#"UPDATE interviews SET
               scheduled_at = COALESCE($1, scheduled_at),
               duration_minutes = COALESCE($2, duration_minutes),
               interview_type = COALESCE($3, interview_type),
               location = COALESCE($4, location),
               meeting_url = COALESCE($5, meeting_url),
               notes = COALESCE($6, notes),
               status = COALESCE($7, status),
               updated_at = NOW()
           WHERE id = $8
           RETURNING *"#,
    )
    .bind(body.scheduled_at)
    .bind(body.duration_minutes)
    .bind(&body.interview_type)
    .bind(&body.location)
    .bind(&body.meeting_url)
    .bind(&body.notes)
    .bind(&body.status)
    .bind(id)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(interview))
}

pub async fn delete_interview(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<Interview>, AppError> {
    crate::middleware::auth::require_role(&auth_user, "employer")?;

    let existing = sqlx::query_as::<_, Interview>("SELECT * FROM interviews WHERE id = $1")
        .bind(id)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("Interview not found".into()))?;

    if existing.created_by != auth_user.user_id {
        return Err(AppError::Forbidden("Not your interview".into()));
    }

    let interview = sqlx::query_as::<_, Interview>(
        "UPDATE interviews SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *",
    )
    .bind(id)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(interview))
}
