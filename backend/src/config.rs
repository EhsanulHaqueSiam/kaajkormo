use std::env;

#[derive(Clone)]
pub struct Config {
    pub database_url: String,
    pub clerk_issuer: String,
    pub clerk_jwks_url: String,
    pub redis_url: String,
    pub meilisearch_url: String,
    pub meilisearch_key: String,
    pub resend_api_key: String,
    pub upload_dir: String,
    pub port: u16,
}

impl Config {
    pub fn from_env() -> Self {
        let clerk_issuer =
            env::var("CLERK_ISSUER").expect("CLERK_ISSUER must be set (e.g. https://your-app.clerk.accounts.dev)");
        let clerk_jwks_url = format!("{}/.well-known/jwks.json", clerk_issuer);

        Self {
            database_url: env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
            clerk_issuer,
            clerk_jwks_url,
            redis_url: env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1:6379".into()),
            meilisearch_url: env::var("MEILISEARCH_URL")
                .unwrap_or_else(|_| "http://127.0.0.1:7700".into()),
            meilisearch_key: env::var("MEILISEARCH_KEY").unwrap_or_default(),
            resend_api_key: env::var("RESEND_API_KEY").unwrap_or_default(),
            upload_dir: env::var("UPLOAD_DIR").unwrap_or_else(|_| "./uploads".into()),
            port: env::var("PORT")
                .unwrap_or_else(|_| "8080".into())
                .parse()
                .expect("PORT must be a valid number"),
        }
    }
}
