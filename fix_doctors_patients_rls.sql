-- FIX RLS POLICIES FOR DOCTORS TABLE
-- The doctors table is getting 406 errors, likely due to RLS policies

-- First, check current RLS status and policies
SELECT '=== DOCTORS TABLE RLS STATUS ===' as info;
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'doctors';

SELECT '=== DOCTORS TABLE POLICIES ===' as info;
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
  AND tablename = 'doctors'
ORDER BY policyname;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "doctors_select_policy" ON public.doctors;
DROP POLICY IF EXISTS "doctors_insert_policy" ON public.doctors;
DROP POLICY IF EXISTS "doctors_update_policy" ON public.doctors;
DROP POLICY IF EXISTS "doctors_delete_policy" ON public.doctors;

-- Create permissive policies for doctors table
CREATE POLICY "doctors_select_policy" ON public.doctors
FOR SELECT USING (true);

CREATE POLICY "doctors_insert_policy" ON public.doctors
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "doctors_update_policy" ON public.doctors
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "doctors_delete_policy" ON public.doctors
FOR DELETE USING (auth.role() = 'authenticated');

-- Also check and fix patients table
SELECT '=== PATIENTS TABLE RLS STATUS ===' as info;
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'patients';

-- Drop existing restrictive policies for patients
DROP POLICY IF EXISTS "patients_select_policy" ON public.patients;
DROP POLICY IF EXISTS "patients_insert_policy" ON public.patients;
DROP POLICY IF EXISTS "patients_update_policy" ON public.patients;
DROP POLICY IF EXISTS "patients_delete_policy" ON public.patients;

-- Create permissive policies for patients table
CREATE POLICY "patients_select_policy" ON public.patients
FOR SELECT USING (true);

CREATE POLICY "patients_insert_policy" ON public.patients
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "patients_update_policy" ON public.patients
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "patients_delete_policy" ON public.patients
FOR DELETE USING (auth.role() = 'authenticated');

-- Ensure RLS is enabled
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Verify the policies were created
SELECT '=== UPDATED POLICIES ===' as info;
SELECT
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('doctors', 'patients')
ORDER BY tablename, policyname;
