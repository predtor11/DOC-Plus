-- QUICK TEST: Run this after applying the automated fix above
-- This will verify that patient insertion now works without 409 errors

-- Test 1: Check current patient status
SELECT '=== CURRENT PATIENT STATUS ===' as test;
SELECT
    COUNT(*) as total_patients,
    COUNT(CASE WHEN assigned_doctor_id IS NULL THEN 1 END) as null_doctor_assignments,
    COUNT(CASE WHEN assigned_doctor_id IS NOT NULL AND
                     EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = p.assigned_doctor_id) THEN 1 END) as valid_doctor_assignments,
    COUNT(CASE WHEN assigned_doctor_id IS NOT NULL AND
                     NOT EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = p.assigned_doctor_id) THEN 1 END) as invalid_doctor_assignments
FROM public.patients p;

-- Test 2: Try inserting a test patient (should work now)
DO $$
DECLARE
    test_doctor_id TEXT;
    test_patient_id UUID;
BEGIN
    -- Get a valid doctor
    SELECT user_id INTO test_doctor_id
    FROM public.doctors
    WHERE user_id IS NOT NULL
    ORDER BY created_at ASC
    LIMIT 1;

    IF test_doctor_id IS NOT NULL THEN
        -- Insert test patient
        INSERT INTO public.patients (
            name, email, user_id, assigned_doctor_id,
            age, gender, phone, medical_history
        ) VALUES (
            '409-Fix-Test-Patient',
            '409-fix-test-' || extract(epoch from now()) || '@example.com',
            'test-user-' || extract(epoch from now()),
            test_doctor_id,
            25,
            'Test',
            '+1987654321',
            'Test case for 409 fix verification'
        ) RETURNING id INTO test_patient_id;

        RAISE NOTICE '✅ SUCCESS: Test patient inserted with ID: %', test_patient_id;

        -- Clean up test patient
        DELETE FROM public.patients WHERE id = test_patient_id;
        RAISE NOTICE '✅ Test patient cleaned up successfully';
    ELSE
        RAISE NOTICE '❌ FAILED: No doctors available for testing';
    END IF;
END $$;

-- Test 3: Verify no more foreign key violations
SELECT '=== FOREIGN KEY VIOLATION CHECK ===' as test;
SELECT
    CASE WHEN COUNT(*) = 0 THEN '✅ PASS: No foreign key violations found'
         ELSE '❌ FAIL: Foreign key violations still exist' END as result,
    COUNT(*) as violations_found
FROM public.patients p
WHERE p.assigned_doctor_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = p.assigned_doctor_id);

-- Test 4: Summary
SELECT '=== TEST SUMMARY ===' as test;
SELECT
    'If all tests show ✅ PASS, then 409 errors are fixed!' as message,
    CASE WHEN (
        SELECT COUNT(*) FROM public.patients p
        WHERE p.assigned_doctor_id IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = p.assigned_doctor_id)
    ) = 0 THEN '✅ READY FOR PRODUCTION' ELSE '❌ NEEDS MORE FIXES' END as status;
