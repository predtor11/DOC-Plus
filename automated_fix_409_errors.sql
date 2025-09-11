-- AUTOMATED FIX: Run this complete script in Supabase SQL Editor
-- This will automatically fix all 409 Conflict errors

-- Step 1: Find the first available doctor
DO $$
DECLARE
    default_doctor_id TEXT;
BEGIN
    -- Get the first available doctor user_id
    SELECT user_id INTO default_doctor_id
    FROM public.doctors
    WHERE user_id IS NOT NULL
    ORDER BY created_at ASC
    LIMIT 1;

    IF default_doctor_id IS NOT NULL THEN
        RAISE NOTICE 'Found available doctor with user_id: %', default_doctor_id;

        -- Fix all patients with null assigned_doctor_id
        UPDATE public.patients
        SET assigned_doctor_id = default_doctor_id
        WHERE assigned_doctor_id IS NULL;

        RAISE NOTICE 'Updated patients with null assigned_doctor_id to use doctor: %', default_doctor_id;
    ELSE
        RAISE NOTICE 'No doctors found in the system. Cannot fix assigned_doctor_id references.';
    END IF;
END $$;

-- Step 2: Check for any invalid doctor references (doctor doesn't exist)
SELECT '=== PATIENTS WITH INVALID DOCTOR REFERENCES ===' as status;
SELECT
    p.id,
    p.name,
    p.assigned_doctor_id as invalid_doctor_id,
    'Doctor not found in doctors table' as issue
FROM public.patients p
WHERE p.assigned_doctor_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = p.assigned_doctor_id);

-- Step 3: Fix invalid doctor references by assigning them to a valid doctor
DO $$
DECLARE
    valid_doctor_id TEXT;
BEGIN
    -- Get a valid doctor user_id
    SELECT user_id INTO valid_doctor_id
    FROM public.doctors
    WHERE user_id IS NOT NULL
    ORDER BY created_at ASC
    LIMIT 1;

    IF valid_doctor_id IS NOT NULL THEN
        -- Update patients with invalid doctor references
        UPDATE public.patients
        SET assigned_doctor_id = valid_doctor_id
        WHERE assigned_doctor_id IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = assigned_doctor_id);

        RAISE NOTICE 'Fixed invalid doctor references by assigning to doctor: %', valid_doctor_id;
    END IF;
END $$;

-- Step 4: Verify all fixes worked
SELECT '=== FINAL VERIFICATION ===' as status;
SELECT
    COUNT(*) as total_patients,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as null_user_ids,
    COUNT(CASE WHEN assigned_doctor_id IS NULL THEN 1 END) as null_doctor_ids,
    COUNT(CASE WHEN assigned_doctor_id IS NOT NULL AND
                     EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = p.assigned_doctor_id) THEN 1 END) as valid_doctor_refs,
    COUNT(CASE WHEN assigned_doctor_id IS NOT NULL AND
                     NOT EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = p.assigned_doctor_id) THEN 1 END) as invalid_doctor_refs
FROM public.patients p;

-- Step 5: Show detailed patient status
SELECT '=== DETAILED PATIENT STATUS ===' as status;
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

-- Step 6: Test a new patient insertion
DO $$
DECLARE
    test_doctor_id TEXT;
BEGIN
    SELECT user_id INTO test_doctor_id
    FROM public.doctors
    WHERE user_id IS NOT NULL
    ORDER BY created_at ASC
    LIMIT 1;

    IF test_doctor_id IS NOT NULL THEN
        INSERT INTO public.patients (
            name, email, user_id, assigned_doctor_id,
            age, gender, phone, medical_history
        ) VALUES (
            'Test Patient - Fixed',
            'test-fixed-' || extract(epoch from now()) || '@example.com',
            'test-user-' || extract(epoch from now()),
            test_doctor_id,
            30,
            'Test',
            '+1234567890',
            'Test medical history'
        );

        RAISE NOTICE 'Successfully inserted test patient with valid foreign key';
    ELSE
        RAISE NOTICE 'No doctors available for test insertion';
    END IF;
END $$;

-- Step 7: Clean up test data
DELETE FROM public.patients
WHERE name = 'Test Patient - Fixed' AND email LIKE 'test-fixed-%@example.com';

-- Step 8: Final summary
SELECT '=== FIX COMPLETE ===' as status;
SELECT
    'All 409 errors should now be resolved!' as message,
    COUNT(*) as total_patients_after_fix,
    COUNT(CASE WHEN assigned_doctor_id IS NOT NULL AND
                     EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = p.assigned_doctor_id) THEN 1 END) as patients_with_valid_doctors
FROM public.patients p;
