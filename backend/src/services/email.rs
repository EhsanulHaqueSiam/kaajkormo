use crate::error::AppError;
use serde_json::json;

#[derive(Clone)]
pub struct EmailService {
    client: reqwest::Client,
    api_key: String,
    from: String,
}

impl EmailService {
    pub fn new(api_key: String) -> Self {
        Self {
            client: reqwest::Client::new(),
            api_key,
            from: "KaajKormo <noreply@kaajkormo.com>".into(),
        }
    }

    pub async fn send_email(&self, to: &str, subject: &str, html: &str) -> Result<(), AppError> {
        if self.api_key.is_empty() {
            tracing::warn!("Email not sent (no API key configured): to={to}, subject={subject}");
            return Ok(());
        }

        let body = json!({
            "from": self.from,
            "to": to,
            "subject": subject,
            "html": html,
        });

        let resp = self
            .client
            .post("https://api.resend.com/emails")
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&body)
            .send()
            .await
            .map_err(|e| AppError::Internal(format!("Failed to send email: {e}")))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let text = resp.text().await.unwrap_or_default();
            tracing::error!("Resend API error {status}: {text}");
            return Err(AppError::Internal(format!(
                "Email service returned {status}"
            )));
        }

        Ok(())
    }

    pub async fn send_welcome(&self, to: &str, name: &str) -> Result<(), AppError> {
        let html = format!(
            r#"<h2>Welcome to KaajKormo, {name}!</h2>
            <p>Your account has been created successfully. Start exploring jobs or posting opportunities today.</p>"#
        );
        self.send_email(to, "Welcome to KaajKormo", &html).await
    }

    pub async fn send_application_received(
        &self,
        to: &str,
        job_title: &str,
        candidate_name: &str,
    ) -> Result<(), AppError> {
        let html = format!(
            r#"<h2>New Application Received</h2>
            <p><strong>{candidate_name}</strong> has applied for the position: <strong>{job_title}</strong>.</p>
            <p>Log in to review the application.</p>"#
        );
        self.send_email(to, &format!("New application for {job_title}"), &html)
            .await
    }

    pub async fn send_status_update(
        &self,
        to: &str,
        job_title: &str,
        new_status: &str,
    ) -> Result<(), AppError> {
        let html = format!(
            r#"<h2>Application Status Updated</h2>
            <p>Your application for <strong>{job_title}</strong> has been updated to: <strong>{new_status}</strong>.</p>
            <p>Log in to view details.</p>"#
        );
        self.send_email(to, &format!("Application update: {job_title}"), &html)
            .await
    }

    pub async fn send_interview_scheduled(
        &self,
        to: &str,
        job_title: &str,
        scheduled_at: &str,
        interview_type: &str,
    ) -> Result<(), AppError> {
        let html = format!(
            r#"<h2>Interview Scheduled</h2>
            <p>An interview has been scheduled for the position: <strong>{job_title}</strong>.</p>
            <ul>
                <li><strong>Type:</strong> {interview_type}</li>
                <li><strong>When:</strong> {scheduled_at}</li>
            </ul>
            <p>Log in to view details and prepare.</p>"#
        );
        self.send_email(to, &format!("Interview scheduled: {job_title}"), &html)
            .await
    }
}
