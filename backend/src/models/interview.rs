use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Interview {
    pub id: Uuid,
    pub application_id: Uuid,
    pub scheduled_at: DateTime<Utc>,
    pub duration_minutes: i32,
    pub interview_type: String,
    pub location: Option<String>,
    pub meeting_url: Option<String>,
    pub notes: Option<String>,
    pub status: String,
    pub created_by: Uuid,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateInterview {
    pub application_id: Uuid,
    pub scheduled_at: DateTime<Utc>,
    pub duration_minutes: Option<i32>,
    pub interview_type: String,
    pub location: Option<String>,
    pub meeting_url: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateInterview {
    pub scheduled_at: Option<DateTime<Utc>>,
    pub duration_minutes: Option<i32>,
    pub interview_type: Option<String>,
    pub location: Option<String>,
    pub meeting_url: Option<String>,
    pub notes: Option<String>,
    pub status: Option<String>,
}
