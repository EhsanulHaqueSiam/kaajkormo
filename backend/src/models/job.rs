use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Job {
    pub id: Uuid,
    pub company_id: Uuid,
    pub posted_by: Uuid,
    pub title: String,
    pub description: String,
    pub requirements: serde_json::Value,
    pub skills: serde_json::Value,
    pub job_type: String,
    pub experience_level: String,
    pub salary_min: Option<i32>,
    pub salary_max: Option<i32>,
    pub salary_currency: Option<String>,
    pub location: Option<String>,
    pub is_remote: bool,
    pub status: String,
    pub deadline: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateJob {
    pub title: String,
    pub description: String,
    pub requirements: Option<serde_json::Value>,
    pub skills: Option<serde_json::Value>,
    pub job_type: Option<String>,
    pub experience_level: Option<String>,
    pub salary_min: Option<i32>,
    pub salary_max: Option<i32>,
    pub salary_currency: Option<String>,
    pub location: Option<String>,
    pub is_remote: Option<bool>,
    pub deadline: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateJob {
    pub title: Option<String>,
    pub description: Option<String>,
    pub requirements: Option<serde_json::Value>,
    pub skills: Option<serde_json::Value>,
    pub job_type: Option<String>,
    pub experience_level: Option<String>,
    pub salary_min: Option<i32>,
    pub salary_max: Option<i32>,
    pub salary_currency: Option<String>,
    pub location: Option<String>,
    pub is_remote: Option<bool>,
    pub status: Option<String>,
    pub deadline: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct JobFilter {
    pub q: Option<String>,
    pub category: Option<String>,
    pub location: Option<String>,
    pub salary_min: Option<i32>,
    pub salary_max: Option<i32>,
    pub job_type: Option<String>,
    pub experience: Option<String>,
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct JobListResponse {
    pub jobs: Vec<Job>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
}
