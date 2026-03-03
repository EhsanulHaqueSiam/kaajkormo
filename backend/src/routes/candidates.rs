use axum::{Json, extract::State};

use crate::AppState;
use crate::error::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::candidate::{CandidateProfile, UpdateCandidateProfile};

pub async fn get_profile(
    State(state): State<AppState>,
    auth_user: AuthUser,
) -> Result<Json<CandidateProfile>, AppError> {
    let profile = sqlx::query_as::<_, CandidateProfile>(
        "SELECT * FROM candidate_profiles WHERE user_id = $1",
    )
    .bind(auth_user.user_id)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Profile not found".into()))?;

    Ok(Json(profile))
}

pub async fn update_profile(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Json(body): Json<UpdateCandidateProfile>,
) -> Result<Json<CandidateProfile>, AppError> {
    let profile = sqlx::query_as::<_, CandidateProfile>(
        r"INSERT INTO candidate_profiles (
               user_id, title, bio, skills, experience_years,
               education, resume_url, location, expected_salary_min, expected_salary_max,
               is_open_to_work, linkedin_url, github_url, portfolio_url, stackoverflow_url,
               leetcode_url, codeforces_url, behance_url, medium_url, personal_website, photo_url
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
           ON CONFLICT (user_id) DO UPDATE SET
               title = COALESCE($2, candidate_profiles.title),
               bio = COALESCE($3, candidate_profiles.bio),
               skills = COALESCE($4, candidate_profiles.skills),
               experience_years = COALESCE($5, candidate_profiles.experience_years),
               education = COALESCE($6, candidate_profiles.education),
               resume_url = COALESCE($7, candidate_profiles.resume_url),
               location = COALESCE($8, candidate_profiles.location),
               expected_salary_min = COALESCE($9, candidate_profiles.expected_salary_min),
               expected_salary_max = COALESCE($10, candidate_profiles.expected_salary_max),
               is_open_to_work = COALESCE($11, candidate_profiles.is_open_to_work),
               linkedin_url = COALESCE($12, candidate_profiles.linkedin_url),
               github_url = COALESCE($13, candidate_profiles.github_url),
               portfolio_url = COALESCE($14, candidate_profiles.portfolio_url),
               stackoverflow_url = COALESCE($15, candidate_profiles.stackoverflow_url),
               leetcode_url = COALESCE($16, candidate_profiles.leetcode_url),
               codeforces_url = COALESCE($17, candidate_profiles.codeforces_url),
               behance_url = COALESCE($18, candidate_profiles.behance_url),
               medium_url = COALESCE($19, candidate_profiles.medium_url),
               personal_website = COALESCE($20, candidate_profiles.personal_website),
               photo_url = COALESCE($21, candidate_profiles.photo_url),
               updated_at = NOW()
           RETURNING *",
    )
    .bind(auth_user.user_id)
    .bind(&body.title)
    .bind(&body.bio)
    .bind(&body.skills)
    .bind(body.experience_years)
    .bind(&body.education)
    .bind(&body.resume_url)
    .bind(&body.location)
    .bind(body.expected_salary_min)
    .bind(body.expected_salary_max)
    .bind(body.is_open_to_work)
    .bind(&body.linkedin_url)
    .bind(&body.github_url)
    .bind(&body.portfolio_url)
    .bind(&body.stackoverflow_url)
    .bind(&body.leetcode_url)
    .bind(&body.codeforces_url)
    .bind(&body.behance_url)
    .bind(&body.medium_url)
    .bind(&body.personal_website)
    .bind(&body.photo_url)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(profile))
}

pub async fn search_candidates(
    State(state): State<AppState>,
    auth_user: AuthUser,
) -> Result<Json<Vec<CandidateProfile>>, AppError> {
    crate::middleware::auth::require_role(&auth_user, "employer")?;

    let candidates = sqlx::query_as::<_, CandidateProfile>(
        "SELECT * FROM candidate_profiles WHERE is_open_to_work = true ORDER BY updated_at DESC LIMIT 50",
    )
    .fetch_all(&state.db)
    .await?;

    Ok(Json(candidates))
}
