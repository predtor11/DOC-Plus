-- Fix realtime configuration for doctor_patient_messages table
-- This migration ensures proper realtime setup for doctor-patient chat

-- Note: The doctor_patient_messages table is already enabled for realtime
-- in the earlier migration 20250912000000_enable_realtime_without_replication.sql

-- Verify that both tables are enabled for realtime
DO $$
BEGIN
    -- Check messages table
    IF EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'messages'
    ) THEN
        RAISE NOTICE '✅ messages table is enabled for realtime';
    ELSE
        RAISE EXCEPTION '❌ messages table is NOT enabled for realtime';
    END IF;

    -- Check doctor_patient_messages table
    IF EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'doctor_patient_messages'
    ) THEN
        RAISE NOTICE '✅ doctor_patient_messages table is enabled for realtime';
    ELSE
        RAISE EXCEPTION '❌ doctor_patient_messages table is NOT enabled for realtime';
    END IF;
END $$;

-- If the publication doesn't exist, create it and add both tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        CREATE PUBLICATION supabase_realtime FOR TABLE messages, doctor_patient_messages;
        RAISE NOTICE 'Created supabase_realtime publication with both tables';
    END IF;
END $$;

-- Ensure both tables are in the publication
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE doctor_patient_messages;

-- Final verification
DO $$
BEGIN
    RAISE NOTICE 'Realtime configuration check:';
    RAISE NOTICE '- messages table: %',
        CASE WHEN EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages')
             THEN 'ENABLED' ELSE 'NOT ENABLED' END;
    RAISE NOTICE '- doctor_patient_messages table: %',
        CASE WHEN EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'doctor_patient_messages')
             THEN 'ENABLED' ELSE 'NOT ENABLED' END;
END $$;
