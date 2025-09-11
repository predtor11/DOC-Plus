-- Quick fix: Just add the missing doctor_patient_messages table
-- Run this in Supabase Dashboard > SQL Editor

-- Check current status first
SELECT
    p.pubname,
    t.tablename
FROM pg_publication p
LEFT JOIN pg_publication_tables t ON p.oid = t.pubid
WHERE p.pubname = 'supabase_realtime'
ORDER BY t.tablename;

-- Add only the missing table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'doctor_patient_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE doctor_patient_messages;
        RAISE NOTICE '✅ Added doctor_patient_messages table to realtime publication';
    ELSE
        RAISE NOTICE 'ℹ️ doctor_patient_messages table already in realtime publication';
    END IF;
END $$;

-- Verify final state
SELECT
    p.pubname,
    t.tablename
FROM pg_publication p
JOIN pg_publication_tables t ON p.oid = t.pubid
WHERE p.pubname = 'supabase_realtime'
ORDER BY t.tablename;
