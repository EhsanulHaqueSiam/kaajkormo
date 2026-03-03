-- Migration: Swipe/discover history for candidates

CREATE TABLE IF NOT EXISTS swipe_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    action VARCHAR(10) NOT NULL CHECK (action IN ('apply', 'skip', 'save')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_swipe_history_user_id ON swipe_history(user_id);
