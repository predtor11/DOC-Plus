-- Simple realtime fix - just add the missing table
-- Run this in Supabase Dashboard > SQL Editor

-- Check current publication status
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Add doctor_patient_messages table if it's missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'doctor_patient_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE doctor_patient_messages;
        RAISE NOTICE '✅ Added doctor_patient_messages to realtime publication';
    ELSE
        RAISE NOTICE 'ℹ️ doctor_patient_messages already in realtime publication';
    END IF;
END $$;

-- Verify the result
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
