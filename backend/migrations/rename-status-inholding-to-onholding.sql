-- Database Migration: Rename status 'Inholding' to 'on-holding'
-- Execute this script to update all existing records in the database

-- Update Risks table
UPDATE risks 
SET status = 'on-holding' 
WHERE status = 'Inholding' OR status = 'inholding';

-- Update Actions table
UPDATE actions 
SET status = 'on-holding' 
WHERE status = 'Inholding' OR status = 'inholding';

-- Update Dependencies table
UPDATE dependencies 
SET status = 'on-holding' 
WHERE status = 'Inholding' OR status = 'inholding';

-- Update Escalations table
UPDATE escalations 
SET status = 'on-holding' 
WHERE status = 'Inholding' OR status = 'inholding';

-- Verify the changes
SELECT 'risks' as table_name, COUNT(*) as count FROM risks WHERE status = 'on-holding'
UNION ALL
SELECT 'actions' as table_name, COUNT(*) as count FROM actions WHERE status = 'on-holding'
UNION ALL
SELECT 'dependencies' as table_name, COUNT(*) as count FROM dependencies WHERE status = 'on-holding'
UNION ALL
SELECT 'escalations' as table_name, COUNT(*) as count FROM escalations WHERE status = 'on-holding';

-- NOTE: Run this migration manually when you're ready to update the database
-- Make sure to backup your database before running this script
