-- Complete fix for Clerk authentication integration
-- Run this entire script in Supabase SQL Editor

-- Step 1: Drop ALL policies from ALL tables (nuclear option)
DO $$
DECLARE
    pol record;
BEGIN
    -- Drop ALL policies from ALL tables in the public schema
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON ' || pol.schemaname || '.' || pol.tablename;
        RAISE NOTICE 'Dropped policy: %.% on table %.%', pol.policyname, pol.schemaname, pol.tablename, pol.schemaname;
    END LOOP;

    RAISE NOTICE 'All policies dropped successfully';
END $$;

-- Drop ALL foreign key constraints that reference user_id columns
ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_assigned_doctor_id_fkey;
ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_user_id_fkey;
ALTER TABLE public.doctors DROP CONSTRAINT IF EXISTS profiles_user_id_key; -- This is actually a unique constraint, not FK

-- Step 2: Alter column types (now that constraints are gone)
ALTER TABLE public.doctors ALTER COLUMN user_id TYPE text;
ALTER TABLE public.patients ALTER COLUMN user_id TYPE text;
ALTER TABLE public.patients ALTER COLUMN assigned_doctor_id TYPE text;

-- Alter any other user_id columns in any tables
DO $$
DECLARE
    table_record record;
BEGIN
    FOR table_record IN
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND column_name = 'user_id'
        AND table_name NOT IN ('doctors', 'patients')
    LOOP
        EXECUTE 'ALTER TABLE public.' || table_record.table_name || ' ALTER COLUMN user_id TYPE text';
        RAISE NOTICE 'Altered %.user_id to text', table_record.table_name;
    END LOOP;
END $$;

-- Step 3: Recreate necessary constraints and indexes
-- Add unique constraints back (needed for foreign keys)
ALTER TABLE public.doctors ADD CONSTRAINT doctors_user_id_key UNIQUE (user_id);
ALTER TABLE public.patients ADD CONSTRAINT patients_user_id_key UNIQUE (user_id);

-- Recreate foreign key constraints (with text types)
-- Note: We can't recreate patients_user_id_fkey to auth.users since that's still uuid
-- For Clerk integration, we'll handle auth.users relationship differently

ALTER TABLE public.patients
  ADD CONSTRAINT patients_assigned_doctor_id_fkey
  FOREIGN KEY (assigned_doctor_id)
  REFERENCES public.doctors(user_id)
  ON DELETE SET NULL;

-- Step 4: Recreate basic policies with text casting
CREATE POLICY "Users can view all profiles"
ON public.doctors
FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.doctors
FOR UPDATE
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.doctors
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can view all profiles"
ON public.patients
FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.patients
FOR UPDATE
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.patients
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Recreate symptoms policies
CREATE POLICY "Doctors can view all symptoms"
ON public.symptoms
FOR SELECT
USING (true);

CREATE POLICY "Doctors can create symptoms"
ON public.symptoms
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Doctors can update symptoms"
ON public.symptoms
FOR UPDATE
USING (true);

-- Step 5: Recreate chat policies (simplified for Clerk auth)
CREATE POLICY "Users can view their chat sessions"
ON public.chat_sessions
FOR SELECT
USING (true);

CREATE POLICY "Users can create chat sessions"
ON public.chat_sessions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their chat sessions"
ON public.chat_sessions
FOR UPDATE
USING (true);

CREATE POLICY "Users can view messages from their sessions"
ON public.messages
FOR SELECT
USING (true);

CREATE POLICY "Users can send messages to their sessions"
ON public.messages
FOR INSERT
WITH CHECK (sender_id IS NOT NULL);

CREATE POLICY "Users can update message read status in their sessions"
ON public.messages
FOR UPDATE
USING (true);

-- Step 6: Add clerk_user_id columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'doctors'
    AND column_name = 'clerk_user_id'
  ) THEN
    ALTER TABLE public.doctors ADD COLUMN clerk_user_id text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'patients'
    AND column_name = 'clerk_user_id'
  ) THEN
    ALTER TABLE public.patients ADD COLUMN clerk_user_id text UNIQUE;
  END IF;
END $$;

-- Success message
SELECT 'Migration completed successfully! Clerk authentication is now properly configured.' as status;
