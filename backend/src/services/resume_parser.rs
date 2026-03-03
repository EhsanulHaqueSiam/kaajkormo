use regex::Regex;

use crate::error::AppError;
use crate::models::resume_parse::ParsedResume;

pub fn parse_pdf(bytes: &[u8]) -> Result<ParsedResume, AppError> {
    let text = pdf_extract::extract_text_from_mem(bytes)
        .map_err(|e| AppError::BadRequest(format!("Failed to parse PDF: {e}")))?;

    let email = extract_email(&text);
    let phone = extract_phone(&text);
    let name = extract_name(&text, email.as_ref());
    let skills = extract_skills(&text);
    let education = extract_education(&text);
    let experience = extract_experience(&text);

    Ok(ParsedResume {
        name,
        email,
        phone,
        skills,
        education,
        experience,
    })
}

fn extract_email(text: &str) -> Option<String> {
    let re = Regex::new(r"[\w.+-]+@[\w-]+\.[\w.-]+").unwrap();
    re.find(text).map(|m| m.as_str().to_string())
}

fn extract_phone(text: &str) -> Option<String> {
    let re = Regex::new(r"(?:\+?880|0)1[3-9]\d{8}").unwrap();
    re.find(text).map(|m| m.as_str().to_string())
}

fn extract_name(text: &str, email: Option<&String>) -> Option<String> {
    for line in text.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        // Skip if it looks like an email or phone
        if let Some(e) = email
            && trimmed.contains(e.as_str())
        {
            continue;
        }
        if trimmed.len() < 100 && !trimmed.contains('@') {
            return Some(trimmed.to_string());
        }
    }
    None
}

fn extract_skills(text: &str) -> Vec<String> {
    let known_skills = [
        "JavaScript",
        "TypeScript",
        "Python",
        "Java",
        "Rust",
        "Go",
        "C++",
        "C#",
        "Ruby",
        "PHP",
        "Swift",
        "Kotlin",
        "React",
        "Angular",
        "Vue",
        "Node.js",
        "Express",
        "Django",
        "Flask",
        "Spring",
        "Docker",
        "Kubernetes",
        "AWS",
        "Azure",
        "GCP",
        "PostgreSQL",
        "MySQL",
        "MongoDB",
        "Redis",
        "GraphQL",
        "REST",
        "Git",
        "Linux",
        "HTML",
        "CSS",
        "Tailwind",
        "Next.js",
        "Svelte",
        "Flutter",
        "React Native",
        "Machine Learning",
        "Deep Learning",
        "TensorFlow",
        "PyTorch",
        "SQL",
        "NoSQL",
        "CI/CD",
        "Agile",
        "Scrum",
    ];

    let text_lower = text.to_lowercase();
    known_skills
        .iter()
        .filter(|skill| text_lower.contains(&skill.to_lowercase()))
        .map(std::string::ToString::to_string)
        .collect()
}

fn extract_education(text: &str) -> Vec<String> {
    let degree_patterns = Regex::new(
        r"(?i)(BSc|B\.Sc|MSc|M\.Sc|BBA|MBA|B\.A|M\.A|B\.Tech|M\.Tech|PhD|Ph\.D|Bachelor|Master|Diploma|HSC|SSC)[^.\n]{0,100}"
    ).unwrap();

    degree_patterns
        .find_iter(text)
        .map(|m| m.as_str().trim().to_string())
        .collect()
}

fn extract_experience(text: &str) -> Vec<String> {
    let year_pattern =
        Regex::new(r"(?i)(20\d{2}\s*[-–]\s*(20\d{2}|present|current|now))[^.\n]{0,150}").unwrap();

    year_pattern
        .find_iter(text)
        .map(|m| m.as_str().trim().to_string())
        .collect()
}
