-- Comprehensive realtime diagnostic
-- Run this in Supabase Dashboard > SQL Editor

-- 1. Check if publication exists
SELECT
    pubname,
    pubowner,
    puballtables,
    pubinsert,
    pubupdate,
    pubdelete
FROM pg_publication
WHERE pubname = 'supabase_realtime';

-- 2. Check what tables are in the publication (simplified)
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- 3. Check if tables exist
SELECT
    schemaname,
    tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('messages', 'doctor_patient_messages')
ORDER BY tablename;

-- 4. Check table structure (first few columns)
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('messages', 'doctor_patient_messages')
ORDER BY table_name, ordinal_position
LIMIT 10;

-- 5. If publication exists but tables are missing, add them safely
DO $$
DECLARE
    pub_exists BOOLEAN;
    msg_exists BOOLEAN;
    dp_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') INTO pub_exists;

    IF pub_exists THEN
        -- Check if tables exist in publication
        SELECT EXISTS(SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages') INTO msg_exists;
        SELECT EXISTS(SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'doctor_patient_messages') INTO dp_exists;

        -- Add messages table if missing
        IF NOT msg_exists THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE messages;
            RAISE NOTICE 'Added messages table to publication';
        END IF;

        -- Add doctor_patient_messages table if missing
        IF NOT dp_exists THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE doctor_patient_messages;
            RAISE NOTICE 'Added doctor_patient_messages table to publication';
        END IF;
    ELSE
        -- Create publication with both tables
        CREATE PUBLICATION supabase_realtime FOR TABLE messages, doctor_patient_messages;
        RAISE NOTICE 'Created new publication with both tables';
    END IF;
END $$;

-- 6. Final verification (simplified)
SELECT
    'Publication Status:' as status,
    pubname,
    tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
