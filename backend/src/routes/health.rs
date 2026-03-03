use axum::Json;
use serde_json::{Value, json};

#[allow(clippy::unused_async)]
pub async fn health_check() -> Json<Value> {
    Json(json!({
        "status": "ok",
        "service": "kaajkormo-backend",
    }))
}
