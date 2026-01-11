-- backend/migrations/user_projects.sql

CREATE TABLE IF NOT EXISTS user_projects (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, project_id)
);

-- Optional: Initial mapping based on existing records (if any)
-- This logic is tricky because module tables use email for project mapping currently in some cases or project_id in others.
-- For now, we leave it empty and let the Admin assign via UI.
