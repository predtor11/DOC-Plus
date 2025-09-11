-- Safe realtime enable script - handles existing configurations
-- Run this in Supabase Dashboard > SQL Editor

-- First, check current publication status
SELECT
    p.pubname,
    t.tablename
FROM pg_publication p
LEFT JOIN pg_publication_tables t ON p.oid = t.pubid
WHERE p.pubname = 'supabase_realtime'
ORDER BY t.tablename;

-- Create publication if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
        RAISE NOTICE 'Created supabase_realtime publication';
    END IF;
END $$;

-- Safely add messages table (ignore if already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
        RAISE NOTICE 'Added messages table to realtime publication';
    ELSE
        RAISE NOTICE 'messages table already in realtime publication';
    END IF;
END $$;

-- Safely add doctor_patient_messages table (ignore if already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'doctor_patient_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE doctor_patient_messages;
        RAISE NOTICE 'Added doctor_patient_messages table to realtime publication';
    ELSE
        RAISE NOTICE 'doctor_patient_messages table already in realtime publication';
    END IF;
END $$;

-- Final verification
SELECT
    p.pubname,
    t.tablename
FROM pg_publication p
JOIN pg_publication_tables t ON p.oid = t.pubid
WHERE p.pubname = 'supabase_realtime'
ORDER BY t.tablename;
