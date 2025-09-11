-- Test basic database operations to verify the fix
-- Run this to confirm everything is working

-- Check current RLS status
SELECT schemaname, tablename, policyname, permissive
FROM pg_policies
WHERE tablename IN ('patients', 'doctors')
ORDER BY tablename, policyname;

-- Test 1: Check if we can query patients table
SELECT 'Test query result:' as status, COUNT(*) as patient_count FROM public.patients;

-- Test 2: Check if we can query doctors table
SELECT 'Test query result:' as status, COUNT(*) as doctor_count FROM public.doctors;

-- Test 3: Check foreign key constraint
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS references_table,
    ccu.column_name AS references_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'patients';

-- Test 4: Try a simple patient insert with valid doctor reference
DO $$
DECLARE
    doctor_user_id TEXT;
BEGIN
    -- Get the first available doctor user_id
    SELECT user_id INTO doctor_user_id
    FROM public.doctors
    LIMIT 1;

    IF doctor_user_id IS NOT NULL THEN
        -- Try to insert a test patient
        INSERT INTO public.patients (name, email, user_id, assigned_doctor_id)
        VALUES ('Test Patient 2', 'test2@example.com', 'test-user-2', doctor_user_id);

        RAISE NOTICE 'Test patient inserted successfully with doctor_id: %', doctor_user_id;
    ELSE
        RAISE NOTICE 'No doctors found in database';
    END IF;
END $$;

-- Test 5: Check if test patient was inserted
SELECT 'Test patient inserted:' as status, COUNT(*) as count
FROM public.patients
WHERE name = 'Test Patient 2';

-- Test 6: Clean up test data
DELETE FROM public.patients WHERE name = 'Test Patient 2';

-- Test 7: Show sample data
SELECT 'Sample doctors:' as info;
SELECT id, user_id, name FROM public.doctors LIMIT 3;

SELECT 'Sample patients:' as info;
SELECT id, user_id, assigned_doctor_id, name FROM public.patients LIMIT 3;
