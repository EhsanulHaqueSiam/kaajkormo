use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Application {
    pub id: Uuid,
    pub job_id: Uuid,
    pub candidate_id: Uuid,
    pub cover_letter: Option<String>,
    pub resume_url: Option<String>,
    pub status: String,
    pub employer_notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateApplication {
    pub job_id: Uuid,
    pub cover_letter: Option<String>,
    pub resume_url: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateApplicationStatus {
    pub status: String,
}
