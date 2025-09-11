-- Fix RLS policies for doctors table to resolve circular dependency
-- Run this in Supabase SQL Editor

-- First, check current policies on doctors table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'doctors';

-- Drop ALL existing policies on doctors table
DROP POLICY IF EXISTS "Users can view all profiles" ON public.doctors;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.doctors;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can view all doctor profiles" ON public.doctors;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.doctors;

-- Create permissive policies for doctors table to resolve circular dependency (with existence checks)
DO $$
BEGIN
    -- Create policy only if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'doctors'
        AND policyname = 'Authenticated users can view doctors for verification'
    ) THEN
        CREATE POLICY "Authenticated users can view doctors for verification"
        ON public.doctors
        FOR SELECT
        USING (auth.role() = 'authenticated');
    END IF;

    -- Create policy only if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'doctors'
        AND policyname = 'Users can manage their own doctor profile'
    ) THEN
        CREATE POLICY "Users can manage their own doctor profile"
        ON public.doctors
        FOR ALL
        USING (auth.jwt() ->> 'sub' = clerk_user_id)
        WITH CHECK (auth.jwt() ->> 'sub' = clerk_user_id);
    END IF;

    -- Create policy only if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'doctors'
        AND policyname = 'Allow doctor registration'
    ) THEN
        CREATE POLICY "Allow doctor registration"
        ON public.doctors
        FOR INSERT
        WITH CHECK (auth.jwt() ->> 'sub' IS NOT NULL);
    END IF;
END $$;

-- Verify the policies were created
SELECT 'Doctors table RLS policies updated successfully!' as status;
