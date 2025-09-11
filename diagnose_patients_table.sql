-- Check current state of patients table and fix any missing columns
-- Run this to diagnose and fix the patients table schema

-- First, check what columns exist in the patients table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'patients'
ORDER BY ordinal_position;

-- Check if clerk_user_id column exists, if not, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'patients'
        AND column_name = 'clerk_user_id'
    ) THEN
        ALTER TABLE public.patients ADD COLUMN clerk_user_id TEXT UNIQUE;
        CREATE INDEX IF NOT EXISTS idx_patients_clerk_user_id ON public.patients(clerk_user_id);
        RAISE NOTICE 'Added clerk_user_id column to patients table';
    ELSE
        RAISE NOTICE 'clerk_user_id column already exists in patients table';
    END IF;
END $$;

-- Check current foreign key constraints
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'patients';

-- Fix foreign key constraint if needed
DO $$
BEGIN
    -- Drop existing foreign key if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'patients'
        AND constraint_name = 'patients_assigned_doctor_id_fkey'
    ) THEN
        ALTER TABLE public.patients DROP CONSTRAINT patients_assigned_doctor_id_fkey;
        RAISE NOTICE 'Dropped existing foreign key constraint';
    END IF;

    -- Add correct foreign key constraint
    ALTER TABLE public.patients
    ADD CONSTRAINT patients_assigned_doctor_id_fkey
    FOREIGN KEY (assigned_doctor_id)
    REFERENCES public.doctors(user_id)
    ON DELETE SET NULL;

    RAISE NOTICE 'Added correct foreign key constraint';
END $$;

-- Check current RLS policies on patients table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'patients';
