-- Project Normalization Migration

-- 1. Update Projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS account text;

-- 2. Update all module tables
DO $$
DECLARE
    t text;
    tables text[] := ARRAY['risks', 'issues', 'actions', 'dependencies', 'escalations', 'appreciations', 'collections'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        -- Add project_id if not exists (should be uuid)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'project_id') THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN project_id uuid', t);
        END IF;

        -- Add project_description
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'project_description') THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN project_description text', t);
        END IF;

        -- Add account
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'account') THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN account text', t);
        END IF;
    END LOOP;
END $$;

-- 3. Migrate data from project_name to project_id (using fuzzy match or exact match)
DO $$
DECLARE
    t text;
    tables text[] := ARRAY['risks', 'issues', 'actions', 'dependencies', 'escalations', 'appreciations', 'collections'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('
            UPDATE %I t
            SET project_id = p.id
            FROM projects p
            WHERE t.project_name = p.name
            AND t.project_id IS NULL
        ', t);
    END LOOP;
END $$;

-- 4. Remove project_name from all modules
DO $$
DECLARE
    t text;
    tables text[] := ARRAY['risks', 'issues', 'actions', 'dependencies', 'escalations', 'appreciations', 'collections'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'project_name') THEN
            EXECUTE format('ALTER TABLE %I DROP COLUMN project_name', t);
        END IF;
    END LOOP;
END $$;
