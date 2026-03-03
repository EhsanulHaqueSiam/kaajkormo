export type UserRole = "candidate" | "employer" | "admin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  employer_id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website?: string;
  location?: string;
  industry?: string;
  size?: string;
  created_at: string;
  updated_at: string;
}

export type JobStatus = "draft" | "published" | "closed" | "archived";
export type JobType = "full-time" | "part-time" | "contract" | "internship";
export type ExperienceLevel = "entry" | "mid" | "senior" | "lead" | "executive";

export interface Job {
  id: string;
  employer_id: string;
  company_id: string;
  title: string;
  slug: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  job_type: JobType;
  experience_level: ExperienceLevel;
  location?: string;
  is_remote: boolean;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  skills: string[];
  status: JobStatus;
  deadline?: string;
  company?: Company;
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus =
  | "pending"
  | "viewed"
  | "shortlisted"
  | "phone_screen"
  | "interview"
  | "assessment"
  | "offered"
  | "rejected"
  | "withdrawn"
  | "hired";

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  cover_letter?: string;
  resume_url?: string;
  status: ApplicationStatus;
  job?: Job;
  candidate?: User;
  created_at: string;
  updated_at: string;
}

export interface CandidateProfile {
  id: string;
  user_id: string;
  headline?: string;
  bio?: string;
  resume_url?: string;
  skills: string[];
  experience_years?: number;
  education?: string;
  location?: string;
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  stackoverflow_url?: string;
  leetcode_url?: string;
  codeforces_url?: string;
  behance_url?: string;
  medium_url?: string;
  personal_website?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationEvent {
  id: string;
  application_id: string;
  from_status: string | null;
  to_status: string;
  note: string | null;
  actor_id: string;
  created_at: string;
}

export interface Interview {
  id: string;
  application_id: string;
  scheduled_at: string;
  duration_minutes: number;
  interview_type: "video" | "phone" | "in_person" | "technical" | "panel";
  location?: string;
  meeting_url?: string;
  notes?: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "rescheduled";
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface JobAlert {
  id: string;
  user_id: string;
  name: string;
  criteria: Record<string, unknown>;
  frequency: "instant" | "daily" | "weekly";
  is_active: boolean;
  last_sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CandidateRating {
  id: string;
  application_id: string;
  employer_id: string;
  rating: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SwipeAction {
  job_id: string;
  action: "apply" | "skip" | "save";
}

export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  skills: string[];
  education: string[];
  experience: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface JobSearchParams {
  q?: string;
  job_type?: JobType;
  experience_level?: ExperienceLevel;
  location?: string;
  is_remote?: boolean;
  skills?: string[];
  page?: number;
  per_page?: number;
}
