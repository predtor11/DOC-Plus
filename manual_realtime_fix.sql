-- Manual real-time publication fix for doctor-patient chat
-- Run this in Supabase SQL Editor if the migration fails

-- Step 1: Check current publication status
SELECT schemaname, tablename, pubname
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Step 2: Remove tables from publication if they exist (to reset)
ALTER PUBLICATION supabase_realtime DROP TABLE public.doctor_patient_messages;
ALTER PUBLICATION supabase_realtime DROP TABLE public.doctor_patient_chat_sessions;

-- Step 3: Re-add tables to publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.doctor_patient_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.doctor_patient_chat_sessions;

-- Step 4: Verify the publication
SELECT schemaname, tablename, pubname
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('doctor_patient_messages', 'doctor_patient_chat_sessions');

-- Step 5: Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'doctor_patient_messages'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 6: Test real-time with a simple query
SELECT id, session_id, sender_id, content, created_at
FROM doctor_patient_messages
ORDER BY created_at DESC
LIMIT 5;
