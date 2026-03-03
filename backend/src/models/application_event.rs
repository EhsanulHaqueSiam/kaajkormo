use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ApplicationEvent {
    pub id: Uuid,
    pub application_id: Uuid,
    pub from_status: Option<String>,
    pub to_status: String,
    pub note: Option<String>,
    pub actor_id: Uuid,
    pub created_at: DateTime<Utc>,
}
