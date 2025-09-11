-- CHECK DATABASE SCHEMA: Run this first to see what columns exist
SELECT '=== DOCTORS TABLE SCHEMA ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'doctors'
ORDER BY ordinal_position;

SELECT '=== PATIENTS TABLE SCHEMA ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'patients'
ORDER BY ordinal_position;

-- Check if clerk_user_id column exists
SELECT '=== CLERK_USER_ID COLUMN CHECK ===' as info;
SELECT
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'doctors'
        AND column_name = 'clerk_user_id'
    ) THEN '✅ clerk_user_id column exists in doctors table'
    ELSE '❌ clerk_user_id column MISSING in doctors table' END as doctors_clerk_status,

    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'patients'
        AND column_name = 'clerk_user_id'
    ) THEN '✅ clerk_user_id column exists in patients table'
    ELSE '❌ clerk_user_id column MISSING in patients table' END as patients_clerk_status;

-- Show current doctors data
SELECT '=== CURRENT DOCTORS DATA ===' as info;
SELECT id, user_id, name, created_at
FROM public.doctors
ORDER BY created_at DESC;
