-- Migration: Switch to Clerk auth and add social profile links

-- Add clerk_id to users table
ALTER TABLE users ADD COLUMN clerk_id VARCHAR(255) UNIQUE;

-- Make password_hash nullable (Clerk handles auth now)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash SET DEFAULT '';

-- Make email nullable (Clerk may use phone-only auth)
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Add social/engineering profile links to candidate_profiles
ALTER TABLE candidate_profiles ADD COLUMN linkedin_url TEXT;
ALTER TABLE candidate_profiles ADD COLUMN github_url TEXT;
ALTER TABLE candidate_profiles ADD COLUMN portfolio_url TEXT;
ALTER TABLE candidate_profiles ADD COLUMN stackoverflow_url TEXT;
ALTER TABLE candidate_profiles ADD COLUMN leetcode_url TEXT;
ALTER TABLE candidate_profiles ADD COLUMN codeforces_url TEXT;
ALTER TABLE candidate_profiles ADD COLUMN behance_url TEXT;
ALTER TABLE candidate_profiles ADD COLUMN medium_url TEXT;
ALTER TABLE candidate_profiles ADD COLUMN personal_website TEXT;

-- Index for clerk_id lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
