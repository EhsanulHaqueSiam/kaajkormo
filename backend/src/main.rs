use std::net::SocketAddr;

use axum::{
    Router, middleware as axum_mw,
    routing::{get, patch, post, put},
};
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;
use tower_http::trace::TraceLayer;
use tracing_subscriber::EnvFilter;

use kaajkormo_backend::AppState;
use kaajkormo_backend::db;
use kaajkormo_backend::middleware::auth::{JwksCache, auth_middleware};
use kaajkormo_backend::routes;
use kaajkormo_backend::services::email::EmailService;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
        .init();

    let config = kaajkormo_backend::config::Config::from_env();
    let port = config.port;

    let pool = db::create_pool(&config.database_url).await;

    // Initialize JWKS cache and pre-fetch keys
    let jwks_cache = JwksCache::new(config.clerk_jwks_url.clone());
    if let Err(e) = jwks_cache.fetch_keys().await {
        tracing::warn!("Failed to pre-fetch JWKS keys (will retry on first request): {e}");
    }

    // Create uploads directory on startup
    std::fs::create_dir_all(&config.upload_dir).ok();

    let email_service = EmailService::new(config.resend_api_key.clone());

    let state = AppState {
        db: pool,
        config,
        jwks_cache,
        email_service,
    };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let upload_dir = state.config.upload_dir.clone();

    let app = Router::new()
        // Health
        .route("/api/health", get(routes::health::health_check))
        // Auth (Clerk-based)
        .route("/api/auth/me", get(routes::auth::me))
        .route("/api/auth/set-role", post(routes::auth::set_role))
        // Jobs
        .route("/api/jobs", get(routes::jobs::list_jobs).post(routes::jobs::create_job))
        .route("/api/jobs/featured", get(routes::jobs::featured_jobs))
        .route("/api/jobs/{id}", get(routes::jobs::get_job).put(routes::jobs::update_job).delete(routes::jobs::delete_job))
        // Applications
        .route("/api/applications", get(routes::applications::list_applications).post(routes::applications::create_application))
        .route("/api/applications/{id}", patch(routes::applications::update_application))
        .route("/api/applications/{id}/events", get(routes::applications::get_application_events))
        // Candidates
        .route("/api/profile", get(routes::candidates::get_profile).put(routes::candidates::update_profile))
        .route("/api/profile/parse-resume", post(routes::resume_parser::parse_resume))
        .route("/api/candidates", get(routes::candidates::search_candidates))
        // Companies
        .route("/api/company", get(routes::companies::get_own_company).put(routes::companies::update_company))
        .route("/api/companies/{id}", get(routes::companies::get_company))
        // Saved jobs
        .route("/api/saved-jobs", get(routes::saved::list_saved_jobs))
        .route("/api/saved-jobs/{jobId}", post(routes::saved::save_job).delete(routes::saved::unsave_job))
        // Uploads
        .route("/api/uploads/resume", post(routes::uploads::upload_resume))
        .route("/api/uploads/photo", post(routes::uploads::upload_photo))
        .route("/api/uploads/logo", post(routes::uploads::upload_logo))
        // Discover / Swipe
        .route("/api/discover/jobs", get(routes::discover::discover_jobs))
        .route("/api/discover/swipe", post(routes::discover::swipe))
        .route("/api/discover/undo", post(routes::discover::undo_swipe))
        // Interviews
        .route("/api/interviews", get(routes::interviews::list_interviews).post(routes::interviews::create_interview))
        .route("/api/interviews/{id}", patch(routes::interviews::update_interview).delete(routes::interviews::delete_interview))
        // Notifications
        .route("/api/notifications", get(routes::notifications::list_notifications))
        .route("/api/notifications/read-all", post(routes::notifications::mark_all_read))
        .route("/api/notifications/unread-count", get(routes::notifications::unread_count))
        .route("/api/notifications/{id}/read", patch(routes::notifications::mark_read))
        // Job Alerts
        .route("/api/job-alerts", get(routes::job_alerts::list_alerts).post(routes::job_alerts::create_alert))
        .route("/api/job-alerts/{id}", put(routes::job_alerts::update_alert).delete(routes::job_alerts::delete_alert))
        // Ratings
        .route("/api/ratings", post(routes::ratings::create_rating))
        .route("/api/ratings/{application_id}", get(routes::ratings::get_rating))
        // Middleware
        .layer(axum_mw::from_fn_with_state(state.clone(), auth_middleware))
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        // Static file serving for uploads
        .nest_service("/uploads", ServeDir::new(upload_dir))
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!("Server listening on {addr}");

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
