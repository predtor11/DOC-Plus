-- CHECK RLS STATUS FOR ALL CHAT-RELATED TABLES
SELECT '=== RLS STATUS FOR CHAT TABLES ===' as info;

-- Check RLS status for all relevant tables
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE WHEN rowsecurity THEN '❌ RLS ENABLED'
         ELSE '✅ RLS DISABLED' END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('chat_sessions', 'messages', 'doctor_patient_chat_sessions', 'doctor_patient_messages')
ORDER BY tablename;

-- Check existing policies for chat tables
SELECT '=== EXISTING POLICIES FOR CHAT TABLES ===' as info;
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('chat_sessions', 'messages', 'doctor_patient_chat_sessions', 'doctor_patient_messages')
ORDER BY tablename, policyname;

-- Check if doctor_patient_chat_sessions table exists and its structure
SELECT '=== DOCTOR_PATIENT_CHAT_SESSIONS TABLE INFO ===' as info;
SELECT
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'doctor_patient_chat_sessions'
    ) THEN '✅ Table exists'
    ELSE '❌ Table does not exist' END as table_status;

-- If table exists, show its columns
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'doctor_patient_chat_sessions'
ORDER BY ordinal_position;
