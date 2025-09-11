-- Check actual realtime publication status
-- Run this in Supabase Dashboard > SQL Editor

-- 1. Check publication details
SELECT
    oid,
    pubname,
    pubowner,
    puballtables,
    pubinsert,
    pubupdate,
    pubdelete,
    pubtruncate
FROM pg_publication
WHERE pubname = 'supabase_realtime';

-- 2. Check publication tables
SELECT
    pubname,
    tablename,
    attnames,
    rowattrs
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 3. Check if publication is active
SELECT
    schemaname,
    tablename,
    'realtime_enabled' as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('messages', 'doctor_patient_messages')
ORDER BY tablename;

-- 4. Check replication slots (if any)
SELECT
    slot_name,
    plugin,
    slot_type,
    active
FROM pg_replication_slots
WHERE slot_type = 'logical'
ORDER BY slot_name;
