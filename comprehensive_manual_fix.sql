-- COMPREHENSIVE MANUAL FIX FOR 409 ERRORS
-- Execute these commands one by one in Supabase SQL Editor

-- 1. First, identify available doctors
SELECT '=== AVAILABLE DOCTORS ===' as section;
SELECT id, user_id, clerk_user_id, name, email
FROM public.doctors
WHERE user_id IS NOT NULL
LIMIT 10;

-- 2. Get the first available doctor ID for fixing null references
SELECT '=== DEFAULT DOCTOR FOR FIXES ===' as section;
SELECT user_id as default_doctor_id, name as default_doctor_name
FROM public.doctors
WHERE user_id IS NOT NULL
ORDER BY created_at ASC
LIMIT 1;

-- 3. Fix patients with null assigned_doctor_id
-- (Replace 'DEFAULT_DOCTOR_ID_HERE' with the actual doctor user_id from step 2)
DO $$
DECLARE
    default_doctor_id TEXT := 'DEFAULT_DOCTOR_ID_HERE'; -- Replace this!
BEGIN
    IF default_doctor_id != 'DEFAULT_DOCTOR_ID_HERE' THEN
        UPDATE public.patients
        SET assigned_doctor_id = default_doctor_id
        WHERE assigned_doctor_id IS NULL;

        RAISE NOTICE 'Fixed % patients with null assigned_doctor_id', (SELECT COUNT(*) FROM public.patients WHERE assigned_doctor_id = default_doctor_id);
    ELSE
        RAISE NOTICE 'Please replace DEFAULT_DOCTOR_ID_HERE with an actual doctor user_id';
    END IF;
END $$;

-- 4. Check for invalid doctor references
SELECT '=== PATIENTS WITH INVALID DOCTOR REFERENCES ===' as section;
SELECT p.id, p.name, p.assigned_doctor_id, 'INVALID - Doctor not found' as issue
FROM public.patients p
WHERE p.assigned_doctor_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = p.assigned_doctor_id);

-- 5. Fix invalid doctor references (if any found in step 4)
-- Uncomment and modify if needed:
-- UPDATE public.patients
-- SET assigned_doctor_id = 'DEFAULT_DOCTOR_ID_HERE'
-- WHERE assigned_doctor_id IN (
--     SELECT p.assigned_doctor_id
--     FROM public.patients p
--     WHERE p.assigned_doctor_id IS NOT NULL
--       AND NOT EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = p.assigned_doctor_id)
-- );

-- 6. Verify all fixes
SELECT '=== FINAL VERIFICATION ===' as section;
SELECT
    COUNT(*) as total_patients,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as null_user_ids,
    COUNT(CASE WHEN assigned_doctor_id IS NULL THEN 1 END) as null_doctor_ids,
    COUNT(CASE WHEN assigned_doctor_id IS NOT NULL AND
                     EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = p.assigned_doctor_id) THEN 1 END) as valid_doctor_refs
FROM public.patients p;

-- 7. Show detailed patient status
SELECT '=== DETAILED PATIENT STATUS ===' as section;
SELECT
    id,
    name,
    user_id,
    assigned_doctor_id,
    CASE WHEN user_id IS NULL THEN 'MISSING user_id' ELSE 'OK' END as user_id_status,
    CASE WHEN assigned_doctor_id IS NULL THEN 'MISSING doctor'
         WHEN NOT EXISTS (SELECT 1 FROM public.doctors WHERE user_id = assigned_doctor_id) THEN 'INVALID doctor'
         ELSE 'VALID doctor' END as doctor_status
FROM public.patients
ORDER BY
    CASE WHEN user_id IS NULL THEN 1
         WHEN assigned_doctor_id IS NULL THEN 2
         WHEN NOT EXISTS (SELECT 1 FROM public.doctors WHERE user_id = assigned_doctor_id) THEN 3
         ELSE 4 END;

-- 8. Test a new patient insertion
-- Uncomment and modify these values:
-- INSERT INTO public.patients (
--     name, email, user_id, assigned_doctor_id,
--     age, gender, phone, medical_history
-- ) VALUES (
--     'Test Patient Fixed',
--     'test-fixed@example.com',
--     'test-user-fixed-id',
--     'DEFAULT_DOCTOR_ID_HERE', -- Replace with actual doctor user_id
--     30,
--     'Male',
--     '+1234567890',
--     'No known medical history'
-- );

-- 9. Verify test insertion worked
-- SELECT 'Test patient inserted:' as status, COUNT(*) as count
-- FROM public.patients
-- WHERE name = 'Test Patient Fixed';

-- 10. Clean up test data (if test was run)
-- DELETE FROM public.patients WHERE name = 'Test Patient Fixed';
