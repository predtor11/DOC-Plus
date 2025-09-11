-- Temporarily disable RLS for debugging doctor-patient chat tables
-- This allows you to see messages in Supabase dashboard for testing
-- REMOVE THIS AFTER DEBUGGING IS COMPLETE

-- First, drop ALL existing policies to ensure clean slate
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    -- Drop all policies on doctor_patient_chat_sessions
    FOR policy_name IN
        SELECT p.policyname
        FROM pg_policies p
        WHERE p.schemaname = 'public'
        AND p.tablename = 'doctor_patient_chat_sessions'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.doctor_patient_chat_sessions', policy_name);
    END LOOP;

    -- Drop all policies on doctor_patient_messages
    FOR policy_name IN
        SELECT p.policyname
        FROM pg_policies p
        WHERE p.schemaname = 'public'
        AND p.tablename = 'doctor_patient_messages'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.doctor_patient_messages', policy_name);
    END LOOP;
END $$;

-- Temporarily disable RLS on doctor_patient_messages
ALTER TABLE public.doctor_patient_messages DISABLE ROW LEVEL SECURITY;

-- Temporarily disable RLS on doctor_patient_chat_sessions
ALTER TABLE public.doctor_patient_chat_sessions DISABLE ROW LEVEL SECURITY;

-- Ensure real-time publication includes our tables (with error handling)
-- This checks if tables are already in the publication before adding them
DO $$
BEGIN
    -- Add doctor_patient_messages to publication if not already present
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'doctor_patient_messages'
        AND schemaname = 'public'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.doctor_patient_messages;
        RAISE NOTICE 'Added doctor_patient_messages to supabase_realtime publication';
    ELSE
        RAISE NOTICE 'doctor_patient_messages is already in supabase_realtime publication';
    END IF;

    -- Add doctor_patient_chat_sessions to publication if not already present
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'doctor_patient_chat_sessions'
        AND schemaname = 'public'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.doctor_patient_chat_sessions;
        RAISE NOTICE 'Added doctor_patient_chat_sessions to supabase_realtime publication';
    ELSE
        RAISE NOTICE 'doctor_patient_chat_sessions is already in supabase_realtime publication';
    END IF;
END $$;

-- Create permissive policies for debugging (REMOVE THESE AFTER DEBUGGING)
CREATE POLICY "Allow all operations on doctor_patient_chat_sessions for debugging"
ON public.doctor_patient_chat_sessions
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on doctor_patient_messages for debugging"
ON public.doctor_patient_messages
FOR ALL
USING (true)
WITH CHECK (true);

-- To re-enable RLS later, run:
-- DROP POLICY "Allow all operations on doctor_patient_chat_sessions for debugging" ON public.doctor_patient_chat_sessions;
-- DROP POLICY "Allow all operations on doctor_patient_messages for debugging" ON public.doctor_patient_messages;
-- ALTER TABLE public.doctor_patient_messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.doctor_patient_chat_sessions ENABLE ROW LEVEL SECURITY;