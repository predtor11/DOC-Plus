-- CHECK WHAT TABLES ACTUALLY EXIST FOR CHAT FUNCTIONALITY
SELECT '=== CHECKING CHAT-RELATED TABLES ===' as info;

-- Check if doctor_patient_chat_sessions exists
SELECT
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'doctor_patient_chat_sessions'
    ) THEN '✅ doctor_patient_chat_sessions table exists'
    ELSE '❌ doctor_patient_chat_sessions table MISSING' END as doctor_patient_sessions_status;

-- Check if doctor_patient_messages exists
SELECT
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'doctor_patient_messages'
    ) THEN '✅ doctor_patient_messages table exists'
    ELSE '❌ doctor_patient_messages table MISSING' END as doctor_patient_messages_status;

-- Check regular chat_sessions table
SELECT
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'chat_sessions'
    ) THEN '✅ chat_sessions table exists'
    ELSE '❌ chat_sessions table MISSING' END as chat_sessions_status;

-- Check messages table
SELECT
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'messages'
    ) THEN '✅ messages table exists'
    ELSE '❌ messages table MISSING' END as messages_status;

-- Show what chat sessions exist
SELECT '=== EXISTING CHAT SESSIONS ===' as info;
SELECT id, session_type, participant_1_id, participant_2_id, title, created_at
FROM public.chat_sessions
ORDER BY created_at DESC
LIMIT 10;

-- Show what patients exist and their user_id status
SELECT '=== PATIENT USER_ID STATUS ===' as info;
SELECT
    id,
    name,
    user_id,
    assigned_doctor_id,
    CASE WHEN user_id IS NULL THEN '❌ MISSING user_id - cannot chat'
         ELSE '✅ Has user_id - can chat' END as chat_status
FROM public.patients
ORDER BY created_at DESC
LIMIT 10;
