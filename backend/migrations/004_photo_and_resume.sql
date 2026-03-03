-- Migration: Add photo URL to candidate profiles and resume parsing table

ALTER TABLE candidate_profiles ADD COLUMN photo_url TEXT;

CREATE TABLE IF NOT EXISTS resume_parses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    file_url TEXT NOT NULL,
    parsed_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
