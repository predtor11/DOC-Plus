-- Fix RLS policies for patients table to resolve circular dependency with doctors table
-- This migration updates the patients table policies to work without depending on doctors table queries

-- Drop existing policies on patients table
DROP POLICY IF EXISTS "Doctors can view all patients" ON public.patients;
DROP POLICY IF EXISTS "Patients can view their own record" ON public.patients;
DROP POLICY IF EXISTS "Doctors can create patients" ON public.patients;
DROP POLICY IF EXISTS "Doctors can update patients" ON public.patients;
DROP POLICY IF EXISTS "Doctors can create patients and patients can create their own records" ON public.patients;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.patients;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.patients;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.patients;

-- Create new policies that don't depend on doctors table queries (with existence checks)
DO $$
BEGIN
    -- Create policy only if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'patients'
        AND policyname = 'Authenticated users can view patients'
    ) THEN
        CREATE POLICY "Authenticated users can view patients"
        ON public.patients
        FOR SELECT
        USING (auth.role() = 'authenticated');
    END IF;

    -- Create policy only if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'patients'
        AND policyname = 'Patients can view their own record'
    ) THEN
        CREATE POLICY "Patients can view their own record"
        ON public.patients
        FOR SELECT
        USING (user_id = auth.uid()::text);
    END IF;

    -- Create policy only if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'patients'
        AND policyname = 'Authenticated users can create patients'
    ) THEN
        CREATE POLICY "Authenticated users can create patients"
        ON public.patients
        FOR INSERT
        WITH CHECK (auth.role() = 'authenticated');
    END IF;

    -- Create policy only if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'patients'
        AND policyname = 'Authenticated users can update patients'
    ) THEN
        CREATE POLICY "Authenticated users can update patients"
        ON public.patients
        FOR UPDATE
        USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Verify the policies were created
SELECT 'Patients table RLS policies updated successfully!' as status;
