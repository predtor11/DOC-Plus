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
