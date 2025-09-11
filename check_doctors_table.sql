-- CHECK DOCTORS TABLE SCHEMA: Find out what columns actually exist
SELECT '=== DOCTORS TABLE COLUMNS ===' as info;
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'doctors'
ORDER BY ordinal_position;

-- Check what data is actually in the doctors table
SELECT '=== DOCTORS TABLE DATA ===' as info;
SELECT * FROM public.doctors LIMIT 5;

-- Check if there are any doctors with the current user's ID
-- Replace 'CURRENT_USER_ID_HERE' with the actual user ID from the error
SELECT '=== CHECK FOR SPECIFIC USER ===' as info;
SELECT
    id,
    user_id,
    clerk_user_id,
    name,
    CASE WHEN user_id = 'user_32VoA44OaYJxHEZdPKAlY0cYOJu' THEN '✅ This is the current user'
         WHEN clerk_user_id = 'user_32VoA44OaYJxHEZdPKAlY0cYOJu' THEN '✅ This is the current user (clerk_id)'
         ELSE '❌ Not the current user' END as user_match
FROM public.doctors
WHERE user_id = 'user_32VoA44OaYJxHEZdPKAlY0cYOJu'
   OR clerk_user_id = 'user_32VoA44OaYJxHEZdPKAlY0cYOJu'
   OR id::text = 'user_32VoA44OaYJxHEZdPKAlY0cYOJu';
