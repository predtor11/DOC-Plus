-- Fix data integrity issues in patients table
-- This will resolve the 409 Conflict errors

-- Step 1: First, let's see what doctors are available
SELECT 'Available doctors:' as info;
SELECT id, user_id, clerk_user_id, name FROM public.doctors;

-- Step 2: Update patients with null assigned_doctor_id to use the first available doctor
DO $$
DECLARE
    default_doctor_id TEXT;
BEGIN
    -- Get the first available doctor user_id
    SELECT user_id INTO default_doctor_id
    FROM public.doctors
    LIMIT 1;

    IF default_doctor_id IS NOT NULL THEN
        -- Update patients with null assigned_doctor_id
        UPDATE public.patients
        SET assigned_doctor_id = default_doctor_id
        WHERE assigned_doctor_id IS NULL;

        RAISE NOTICE 'Updated patients with null assigned_doctor_id to use doctor: %', default_doctor_id;
    ELSE
        RAISE NOTICE 'No doctors found - cannot fix null assigned_doctor_id';
    END IF;
END $$;

-- Step 3: For patients with null user_id, we can either:
-- Option A: Delete them (if they're test/incomplete records)
-- Option B: Set a default user_id (not recommended for production)

-- Let's check how many patients have null user_id
SELECT 'Patients with null user_id:' as count, COUNT(*) as total
FROM public.patients
WHERE user_id IS NULL;

-- Option: Delete incomplete patient records (uncomment if desired)
-- DELETE FROM public.patients WHERE user_id IS NULL;

-- Step 4: Verify the fixes
SELECT 'After fixes - patient status:' as info;
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

-- Step 5: Test a new patient insertion
DO $$
DECLARE
    doctor_user_id TEXT;
BEGIN
    SELECT user_id INTO doctor_user_id
    FROM public.doctors
    LIMIT 1;

    IF doctor_user_id IS NOT NULL THEN
        INSERT INTO public.patients (name, email, user_id, assigned_doctor_id)
        VALUES ('Test Patient Fixed', 'test-fixed@example.com', 'test-user-fixed', doctor_user_id);

        RAISE NOTICE 'Successfully inserted test patient with valid foreign key';
    END IF;
END $$;

-- Step 6: Verify the test insertion worked
SELECT 'Test patient inserted:' as status, COUNT(*) as count
FROM public.patients
WHERE name = 'Test Patient Fixed';

-- Step 7: Clean up test data
DELETE FROM public.patients WHERE name = 'Test Patient Fixed';

-- Step 8: Final summary
SELECT
    'Final Summary:' as info,
    COUNT(*) as total_patients,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as null_user_ids,
    COUNT(CASE WHEN assigned_doctor_id IS NULL THEN 1 END) as null_doctor_ids,
    COUNT(CASE WHEN user_id IS NOT NULL AND assigned_doctor_id IS NOT NULL THEN 1 END) as valid_records
FROM public.patients;
