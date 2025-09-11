-- MANUAL FIX: Run these SQL commands in Supabase SQL Editor
-- This will fix the 409 Conflict errors by addressing data integrity issues

-- MANUAL FIX: Run these SQL commands in Supabase SQL Editor
-- This will fix the 409 Conflict errors by addressing data integrity issues

-- Step 1: Check available doctors FIRST
SELECT 'Available doctors:' as info;
SELECT id, user_id, clerk_user_id, name, email
FROM public.doctors
WHERE user_id IS NOT NULL
ORDER BY created_at ASC;

-- COPY ONE OF THE user_id VALUES FROM ABOVE AND REPLACE IN STEP 2
-- For example: 'c2788369-984a-410e-8f1f-90b77be6080b'

-- Step 2: Fix patients with null assigned_doctor_id
-- REPLACE 'your-doctor-user-id-here' WITH AN ACTUAL user_id FROM STEP 1 ABOVE
UPDATE public.patients
SET assigned_doctor_id = 'your-doctor-user-id-here'  -- <-- REPLACE THIS
WHERE assigned_doctor_id IS NULL;

-- Step 3: Verify the fixes
SELECT
    id,
    name,
    user_id,
    assigned_doctor_id,
    CASE WHEN user_id IS NULL THEN 'MISSING user_id' ELSE 'OK' END as user_id_status,
    CASE WHEN assigned_doctor_id IS NULL THEN 'MISSING doctor'
         WHEN NOT EXISTS (SELECT 1 FROM public.doctors WHERE user_id = assigned_doctor_id) THEN 'INVALID doctor'
         ELSE 'VALID doctor' END as doctor_status
FROM public.patients;

-- Step 4: Optional - Remove incomplete patient records (use with caution)
-- DELETE FROM public.patients WHERE user_id IS NULL;

-- Step 5: Test insertion (replace with actual values)
-- INSERT INTO public.patients (name, email, user_id, assigned_doctor_id)
-- VALUES ('Test Patient', 'test@example.com', 'test-user-id', 'your-doctor-user-id-here');
