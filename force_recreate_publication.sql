-- Force recreate realtime publication if needed
-- Run this in Supabase Dashboard > SQL Editor

-- First, check current status
SELECT 'BEFORE' as stage, * FROM pg_publication WHERE pubname = 'supabase_realtime';
SELECT 'BEFORE' as stage, * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Drop existing publication if it exists
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Create fresh publication with both tables
CREATE PUBLICATION supabase_realtime FOR TABLE messages, doctor_patient_messages;

-- Verify the new publication
SELECT 'AFTER' as stage, * FROM pg_publication WHERE pubname = 'supabase_realtime';
SELECT 'AFTER' as stage, * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Check table existence
SELECT
    schemaname,
    tablename,
    'exists' as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('messages', 'doctor_patient_messages')
ORDER BY tablename;
