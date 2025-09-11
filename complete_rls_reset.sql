-- Complete RLS policy reset and fix for all tables
-- This script will completely reset all RLS policies and create working ones

-- Step 1: Drop ALL existing policies from ALL tables
DO $$
DECLARE
    pol record;
BEGIN
    RAISE NOTICE 'Dropping all existing policies...';
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

-- Step 2: Disable RLS temporarily to allow access during setup
ALTER TABLE public.doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptoms DISABLE ROW LEVEL SECURITY;

-- Step 3: Create simple permissive policies for doctors table
CREATE POLICY "doctors_select_policy" ON public.doctors
FOR SELECT USING (true);

CREATE POLICY "doctors_insert_policy" ON public.doctors
FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' IS NOT NULL);

CREATE POLICY "doctors_update_policy" ON public.doctors
FOR UPDATE USING (auth.jwt() ->> 'sub' = clerk_user_id);

CREATE POLICY "doctors_delete_policy" ON public.doctors
FOR DELETE USING (auth.jwt() ->> 'sub' = clerk_user_id);

-- Step 4: Create simple permissive policies for patients table
CREATE POLICY "patients_select_policy" ON public.patients
FOR SELECT USING (true);

CREATE POLICY "patients_insert_policy" ON public.patients
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "patients_update_policy" ON public.patients
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "patients_delete_policy" ON public.patients
FOR DELETE USING (auth.role() = 'authenticated');

-- Step 5: Create simple permissive policies for chat_sessions table
CREATE POLICY "chat_sessions_select_policy" ON public.chat_sessions
FOR SELECT USING (true);

CREATE POLICY "chat_sessions_insert_policy" ON public.chat_sessions
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "chat_sessions_update_policy" ON public.chat_sessions
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "chat_sessions_delete_policy" ON public.chat_sessions
FOR DELETE USING (auth.role() = 'authenticated');

-- Step 6: Create simple permissive policies for messages table
CREATE POLICY "messages_select_policy" ON public.messages
FOR SELECT USING (true);

CREATE POLICY "messages_insert_policy" ON public.messages
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "messages_update_policy" ON public.messages
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "messages_delete_policy" ON public.messages
FOR DELETE USING (auth.role() = 'authenticated');

-- Step 7: Create simple permissive policies for symptoms table
CREATE POLICY "symptoms_select_policy" ON public.symptoms
FOR SELECT USING (true);

CREATE POLICY "symptoms_insert_policy" ON public.symptoms
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "symptoms_update_policy" ON public.symptoms
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "symptoms_delete_policy" ON public.symptoms
FOR DELETE USING (auth.role() = 'authenticated');

-- Step 8: Re-enable RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;

-- Step 9: Verify the setup
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
