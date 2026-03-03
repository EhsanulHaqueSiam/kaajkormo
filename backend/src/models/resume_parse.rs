use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ResumeParse {
    pub id: Uuid,
    pub user_id: Uuid,
    pub original_filename: String,
    pub file_url: String,
    pub parsed_data: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParsedResume {
    pub name: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub skills: Vec<String>,
    pub education: Vec<String>,
    pub experience: Vec<String>,
}
