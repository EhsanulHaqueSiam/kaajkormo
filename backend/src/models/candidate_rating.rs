use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CandidateRating {
    pub id: Uuid,
    pub application_id: Uuid,
    pub employer_id: Uuid,
    pub rating: i32,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateCandidateRating {
    pub application_id: Uuid,
    pub rating: i32,
    pub notes: Option<String>,
}
