-- Database Migration: Rename status 'Inholding' to 'On Hold'
-- Execute this script to update all existing records in the database

-- Update Risks table
UPDATE risks 
SET status = 'On Hold' 
WHERE status ILIKE 'inholding' OR status = 'on-holding' OR status = 'On Hold';

-- Update Issues table
UPDATE issues 
SET status = 'On Hold' 
WHERE status ILIKE 'inholding' OR status = 'on-holding' OR status = 'On Hold';

-- Update Actions table
UPDATE actions 
SET status = 'On Hold' 
WHERE status ILIKE 'inholding' OR status = 'on-holding' OR status = 'On Hold';

-- Update Dependencies table
UPDATE dependencies 
SET status = 'On Hold' 
WHERE status ILIKE 'inholding' OR status = 'on-holding' OR status = 'On Hold';

-- Update Escalations table
UPDATE escalations 
SET status = 'On Hold' 
WHERE status ILIKE 'inholding' OR status = 'on-holding' OR status = 'On Hold';

-- Verify the changes
SELECT 'risks' as table_name, COUNT(*) as count FROM risks WHERE status = 'On Hold'
UNION ALL
SELECT 'issues' as table_name, COUNT(*) as count FROM issues WHERE status = 'On Hold'
UNION ALL
SELECT 'actions' as table_name, COUNT(*) as count FROM actions WHERE status = 'On Hold'
UNION ALL
SELECT 'dependencies' as table_name, COUNT(*) as count FROM dependencies WHERE status = 'On Hold'
UNION ALL
SELECT 'escalations' as table_name, COUNT(*) as count FROM escalations WHERE status = 'On Hold';
