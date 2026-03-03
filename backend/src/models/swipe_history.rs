use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct SwipeHistory {
    pub id: Uuid,
    pub user_id: Uuid,
    pub job_id: Uuid,
    pub action: String,
    pub created_at: DateTime<Utc>,
}
