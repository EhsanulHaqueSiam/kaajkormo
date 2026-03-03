use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CandidateProfile {
    pub id: Uuid,
    pub user_id: Uuid,
    pub title: Option<String>,
    pub bio: Option<String>,
    pub skills: serde_json::Value,
    pub experience_years: Option<i32>,
    pub education: serde_json::Value,
    pub resume_url: Option<String>,
    pub location: Option<String>,
    pub expected_salary_min: Option<i32>,
    pub expected_salary_max: Option<i32>,
    pub is_open_to_work: bool,
    // Social / engineering profiles
    pub linkedin_url: Option<String>,
    pub github_url: Option<String>,
    pub portfolio_url: Option<String>,
    pub stackoverflow_url: Option<String>,
    pub leetcode_url: Option<String>,
    pub codeforces_url: Option<String>,
    pub behance_url: Option<String>,
    pub medium_url: Option<String>,
    pub personal_website: Option<String>,
    pub photo_url: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCandidateProfile {
    pub title: Option<String>,
    pub bio: Option<String>,
    pub skills: Option<serde_json::Value>,
    pub experience_years: Option<i32>,
    pub education: Option<serde_json::Value>,
    pub resume_url: Option<String>,
    pub location: Option<String>,
    pub expected_salary_min: Option<i32>,
    pub expected_salary_max: Option<i32>,
    pub is_open_to_work: Option<bool>,
    // Social / engineering profiles
    pub linkedin_url: Option<String>,
    pub github_url: Option<String>,
    pub portfolio_url: Option<String>,
    pub stackoverflow_url: Option<String>,
    pub leetcode_url: Option<String>,
    pub codeforces_url: Option<String>,
    pub behance_url: Option<String>,
    pub medium_url: Option<String>,
    pub personal_website: Option<String>,
    pub photo_url: Option<String>,
}
