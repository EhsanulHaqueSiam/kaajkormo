use axum::extract::{Path, State};
use axum::Json;
use uuid::Uuid;

use crate::error::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::candidate_rating::{CandidateRating, CreateCandidateRating};
use crate::AppState;

pub async fn create_rating(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Json(body): Json<CreateCandidateRating>,
) -> Result<Json<CandidateRating>, AppError> {
    crate::middleware::auth::require_role(&auth_user, "employer")?;

    if body.rating < 1 || body.rating > 5 {
        return Err(AppError::BadRequest("Rating must be between 1 and 5".into()));
    }

    // Verify the employer owns the job for this application
    let app = sqlx::query_as::<_, crate::models::application::Application>(
        "SELECT * FROM applications WHERE id = $1",
    )
    .bind(body.application_id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Application not found".into()))?;

    let job = sqlx::query_as::<_, crate::models::job::Job>(
        "SELECT * FROM jobs WHERE id = $1",
    )
    .bind(app.job_id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Job not found".into()))?;

    if job.posted_by != auth_user.user_id {
        return Err(AppError::Forbidden("Not your job posting".into()));
    }

    let rating = sqlx::query_as::<_, CandidateRating>(
        r#"INSERT INTO candidate_ratings (application_id, employer_id, rating, notes)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (application_id, employer_id) DO UPDATE SET
               rating = $3,
               notes = COALESCE($4, candidate_ratings.notes),
               updated_at = NOW()
           RETURNING *"#,
    )
    .bind(body.application_id)
    .bind(auth_user.user_id)
    .bind(body.rating)
    .bind(&body.notes)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(rating))
}

pub async fn get_rating(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Path(application_id): Path<Uuid>,
) -> Result<Json<CandidateRating>, AppError> {
    crate::middleware::auth::require_role(&auth_user, "employer")?;

    let rating = sqlx::query_as::<_, CandidateRating>(
        "SELECT * FROM candidate_ratings WHERE application_id = $1 AND employer_id = $2",
    )
    .bind(application_id)
    .bind(auth_user.user_id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Rating not found".into()))?;

    Ok(Json(rating))
}
