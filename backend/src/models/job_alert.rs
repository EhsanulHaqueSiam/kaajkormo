use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct JobAlert {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: Option<String>,
    pub criteria: serde_json::Value,
    pub frequency: String,
    pub is_active: bool,
    pub last_sent_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateJobAlert {
    pub name: Option<String>,
    pub criteria: serde_json::Value,
    pub frequency: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateJobAlert {
    pub name: Option<String>,
    pub criteria: Option<serde_json::Value>,
    pub frequency: Option<String>,
    pub is_active: Option<bool>,
}
