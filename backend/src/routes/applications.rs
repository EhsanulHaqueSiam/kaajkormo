use axum::{
    Json,
    extract::{Path, State},
};
use uuid::Uuid;

use crate::AppState;
use crate::error::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::application::{Application, CreateApplication, UpdateApplicationStatus};
use crate::models::application_event::ApplicationEvent;

pub async fn create_application(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Json(body): Json<CreateApplication>,
) -> Result<Json<Application>, AppError> {
    crate::middleware::auth::require_role(&auth_user, "candidate")?;

    let app = sqlx::query_as::<_, Application>(
        r"INSERT INTO applications (job_id, candidate_id, cover_letter, resume_url)
           VALUES ($1, $2, $3, $4)
           RETURNING *",
    )
    .bind(body.job_id)
    .bind(auth_user.user_id)
    .bind(&body.cover_letter)
    .bind(&body.resume_url)
    .fetch_one(&state.db)
    .await
    .map_err(|e| match e {
        sqlx::Error::Database(ref db_err)
            if db_err.constraint() == Some("applications_job_id_candidate_id_key") =>
        {
            AppError::Conflict("Already applied to this job".into())
        }
        other => AppError::Database(other),
    })?;

    Ok(Json(app))
}

pub async fn list_applications(
    State(state): State<AppState>,
    auth_user: AuthUser,
) -> Result<Json<Vec<Application>>, AppError> {
    let apps = if auth_user.role == "candidate" {
        sqlx::query_as::<_, Application>(
            "SELECT * FROM applications WHERE candidate_id = $1 ORDER BY created_at DESC",
        )
        .bind(auth_user.user_id)
        .fetch_all(&state.db)
        .await?
    } else if auth_user.role == "employer" {
        sqlx::query_as::<_, Application>(
            r"SELECT a.* FROM applications a
               JOIN jobs j ON a.job_id = j.id
               WHERE j.posted_by = $1
               ORDER BY a.created_at DESC",
        )
        .bind(auth_user.user_id)
        .fetch_all(&state.db)
        .await?
    } else {
        sqlx::query_as::<_, Application>("SELECT * FROM applications ORDER BY created_at DESC")
            .fetch_all(&state.db)
            .await?
    };

    Ok(Json(apps))
}

pub async fn update_application(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateApplicationStatus>,
) -> Result<Json<Application>, AppError> {
    let existing = sqlx::query_as::<_, Application>("SELECT * FROM applications WHERE id = $1")
        .bind(id)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("Application not found".into()))?;

    // Candidates can only withdraw their own applications
    if auth_user.role == "candidate" {
        if existing.candidate_id != auth_user.user_id {
            return Err(AppError::Forbidden("Not your application".into()));
        }
        if body.status != "withdrawn" {
            return Err(AppError::BadRequest("Candidates can only withdraw".into()));
        }
    }

    // Employers can only update applications for their jobs
    if auth_user.role == "employer" {
        let job = sqlx::query_as::<_, crate::models::job::Job>("SELECT * FROM jobs WHERE id = $1")
            .bind(existing.job_id)
            .fetch_optional(&state.db)
            .await?
            .ok_or_else(|| AppError::NotFound("Job not found".into()))?;

        if job.posted_by != auth_user.user_id {
            return Err(AppError::Forbidden("Not your job posting".into()));
        }
    }

    let old_status = existing.status.clone();

    let app = sqlx::query_as::<_, Application>(
        "UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
    )
    .bind(&body.status)
    .bind(id)
    .fetch_one(&state.db)
    .await?;

    // Record the status change event
    sqlx::query(
        r"INSERT INTO application_events (application_id, from_status, to_status, actor_id)
           VALUES ($1, $2, $3, $4)",
    )
    .bind(id)
    .bind(&old_status)
    .bind(&body.status)
    .bind(auth_user.user_id)
    .execute(&state.db)
    .await?;

    // Notify the candidate about the status change
    let _ = crate::services::notifications::create_notification(
        &state.db,
        existing.candidate_id,
        "status_change",
        &format!("Application status updated to {}", body.status),
        Some(&format!(
            "Your application status changed from {} to {}",
            old_status, body.status
        )),
        Some(serde_json::json!({
            "application_id": id,
            "from_status": old_status,
            "to_status": body.status,
        })),
    )
    .await;

    // Send email notification to candidate (fire and forget)
    let db = state.db.clone();
    let email_service = state.email_service.clone();
    let candidate_id = existing.candidate_id;
    let job_id = existing.job_id;
    let new_status = body.status.clone();
    tokio::spawn(async move {
        let candidate_email: Option<String> =
            sqlx::query_scalar("SELECT email FROM users WHERE id = $1")
                .bind(candidate_id)
                .fetch_optional(&db)
                .await
                .ok()
                .flatten();

        if let Some(email) = candidate_email
            && !email.is_empty()
        {
            let job_title: Option<String> =
                sqlx::query_scalar("SELECT title FROM jobs WHERE id = $1")
                    .bind(job_id)
                    .fetch_optional(&db)
                    .await
                    .ok()
                    .flatten();

            if let Some(title) = job_title {
                let _ = email_service
                    .send_status_update(&email, &title, &new_status)
                    .await;
            }
        }
    });

    Ok(Json(app))
}

pub async fn get_application_events(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<Vec<ApplicationEvent>>, AppError> {
    // Verify the user has access to this application
    let app = sqlx::query_as::<_, Application>("SELECT * FROM applications WHERE id = $1")
        .bind(id)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("Application not found".into()))?;

    if auth_user.role == "candidate" && app.candidate_id != auth_user.user_id {
        return Err(AppError::Forbidden("Not your application".into()));
    }

    if auth_user.role == "employer" {
        let job = sqlx::query_as::<_, crate::models::job::Job>("SELECT * FROM jobs WHERE id = $1")
            .bind(app.job_id)
            .fetch_optional(&state.db)
            .await?
            .ok_or_else(|| AppError::NotFound("Job not found".into()))?;

        if job.posted_by != auth_user.user_id {
            return Err(AppError::Forbidden("Not your job posting".into()));
        }
    }

    let events = sqlx::query_as::<_, ApplicationEvent>(
        "SELECT * FROM application_events WHERE application_id = $1 ORDER BY created_at ASC",
    )
    .bind(id)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(events))
}
