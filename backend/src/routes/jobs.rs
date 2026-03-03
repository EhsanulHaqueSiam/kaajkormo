use axum::{
    Json,
    extract::{Path, Query, State},
};
use uuid::Uuid;

use crate::AppState;
use crate::error::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::job::{CreateJob, Job, JobFilter, JobListResponse, UpdateJob};

fn slugify(title: &str) -> String {
    let base: String = title
        .to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() { c } else { '-' })
        .collect();
    let base = base.trim_matches('-').to_string();
    let suffix = &Uuid::new_v4().to_string()[..8];
    format!("{base}-{suffix}")
}

pub async fn list_jobs(
    State(state): State<AppState>,
    Query(filter): Query<JobFilter>,
) -> Result<Json<JobListResponse>, AppError> {
    let page = filter.page.unwrap_or(1).max(1);
    let per_page = filter.per_page.unwrap_or(20).min(100);
    let offset = (page - 1) * per_page;

    let q_pattern = filter.q.as_deref().map(|q| format!("%{q}%"));

    let jobs = sqlx::query_as::<_, Job>(
        r#"SELECT * FROM jobs
           WHERE status = 'active'
             AND ($1::text IS NULL OR title ILIKE $1 OR description ILIKE $1)
             AND ($2::text IS NULL OR location ILIKE $2)
             AND ($3::int IS NULL OR salary_min >= $3)
             AND ($4::int IS NULL OR salary_max <= $4)
             AND ($5::text IS NULL OR job_type = $5)
             AND ($6::text IS NULL OR experience_level = $6)
           ORDER BY created_at DESC
           LIMIT $7 OFFSET $8"#,
    )
    .bind(&q_pattern)
    .bind(&filter.location)
    .bind(filter.salary_min)
    .bind(filter.salary_max)
    .bind(&filter.job_type)
    .bind(&filter.experience)
    .bind(per_page)
    .bind(offset)
    .fetch_all(&state.db)
    .await?;

    let total: (i64,) = sqlx::query_as(
        r#"SELECT COUNT(*) FROM jobs
           WHERE status = 'active'
             AND ($1::text IS NULL OR title ILIKE $1 OR description ILIKE $1)
             AND ($2::text IS NULL OR location ILIKE $2)
             AND ($3::int IS NULL OR salary_min >= $3)
             AND ($4::int IS NULL OR salary_max <= $4)
             AND ($5::text IS NULL OR job_type = $5)
             AND ($6::text IS NULL OR experience_level = $6)"#,
    )
    .bind(&q_pattern)
    .bind(&filter.location)
    .bind(filter.salary_min)
    .bind(filter.salary_max)
    .bind(&filter.job_type)
    .bind(&filter.experience)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(JobListResponse {
        jobs,
        total: total.0,
        page,
        per_page,
    }))
}

pub async fn get_job(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<Job>, AppError> {
    let job = sqlx::query_as::<_, Job>("SELECT * FROM jobs WHERE id = $1")
        .bind(id)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("Job not found".into()))?;

    Ok(Json(job))
}

pub async fn featured_jobs(State(state): State<AppState>) -> Result<Json<Vec<Job>>, AppError> {
    let jobs = sqlx::query_as::<_, Job>(
        "SELECT * FROM jobs WHERE status = 'active' ORDER BY created_at DESC LIMIT 6",
    )
    .fetch_all(&state.db)
    .await?;

    Ok(Json(jobs))
}

pub async fn create_job(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Json(body): Json<CreateJob>,
) -> Result<Json<Job>, AppError> {
    crate::middleware::auth::require_role(&auth_user, "employer")?;

    let company = sqlx::query_as::<_, crate::models::company::Company>(
        "SELECT * FROM companies WHERE owner_id = $1",
    )
    .bind(auth_user.user_id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::BadRequest("Create a company profile first".into()))?;

    let _slug = slugify(&body.title);

    let job = sqlx::query_as::<_, Job>(
        r#"INSERT INTO jobs (company_id, posted_by, title, description, requirements, skills,
            job_type, experience_level, salary_min, salary_max, salary_currency, location, is_remote, deadline)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           RETURNING *"#,
    )
    .bind(company.id)
    .bind(auth_user.user_id)
    .bind(&body.title)
    .bind(&body.description)
    .bind(body.requirements.as_ref().unwrap_or(&serde_json::json!([])))
    .bind(body.skills.as_ref().unwrap_or(&serde_json::json!([])))
    .bind(body.job_type.as_deref().unwrap_or("full_time"))
    .bind(body.experience_level.as_deref().unwrap_or("mid"))
    .bind(body.salary_min)
    .bind(body.salary_max)
    .bind(body.salary_currency.as_deref().unwrap_or("BDT"))
    .bind(&body.location)
    .bind(body.is_remote.unwrap_or(false))
    .bind(body.deadline)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(job))
}

pub async fn update_job(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateJob>,
) -> Result<Json<Job>, AppError> {
    crate::middleware::auth::require_role(&auth_user, "employer")?;

    let existing = sqlx::query_as::<_, Job>("SELECT * FROM jobs WHERE id = $1")
        .bind(id)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("Job not found".into()))?;

    if existing.posted_by != auth_user.user_id {
        return Err(AppError::Forbidden("Not your job posting".into()));
    }

    let job = sqlx::query_as::<_, Job>(
        r#"UPDATE jobs SET
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            requirements = COALESCE($3, requirements),
            skills = COALESCE($4, skills),
            job_type = COALESCE($5, job_type),
            experience_level = COALESCE($6, experience_level),
            salary_min = COALESCE($7, salary_min),
            salary_max = COALESCE($8, salary_max),
            salary_currency = COALESCE($9, salary_currency),
            location = COALESCE($10, location),
            is_remote = COALESCE($11, is_remote),
            status = COALESCE($12, status),
            deadline = COALESCE($13, deadline),
            updated_at = NOW()
           WHERE id = $14
           RETURNING *"#,
    )
    .bind(&body.title)
    .bind(&body.description)
    .bind(&body.requirements)
    .bind(&body.skills)
    .bind(&body.job_type)
    .bind(&body.experience_level)
    .bind(body.salary_min)
    .bind(body.salary_max)
    .bind(&body.salary_currency)
    .bind(&body.location)
    .bind(body.is_remote)
    .bind(&body.status)
    .bind(body.deadline)
    .bind(id)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(job))
}

pub async fn delete_job(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    crate::middleware::auth::require_role(&auth_user, "employer")?;

    let existing = sqlx::query_as::<_, Job>("SELECT * FROM jobs WHERE id = $1")
        .bind(id)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("Job not found".into()))?;

    if existing.posted_by != auth_user.user_id {
        return Err(AppError::Forbidden("Not your job posting".into()));
    }

    sqlx::query("UPDATE jobs SET status = 'closed', updated_at = NOW() WHERE id = $1")
        .bind(id)
        .execute(&state.db)
        .await?;

    Ok(Json(serde_json::json!({"message": "Job closed"})))
}
