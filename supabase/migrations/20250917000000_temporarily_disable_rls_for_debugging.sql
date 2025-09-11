-- Temporarily disable RLS for debugging doctor-patient chat tables
-- This allows you to see messages in Supabase dashboard for testing
-- REMOVE THIS AFTER DEBUGGING IS COMPLETE

-- Temporarily disable RLS on doctor_patient_messages
ALTER TABLE public.doctor_patient_messages DISABLE ROW LEVEL SECURITY;

-- Temporarily disable RLS on doctor_patient_chat_sessions
ALTER TABLE public.doctor_patient_chat_sessions DISABLE ROW LEVEL SECURITY;

-- To re-enable RLS later, run:
-- ALTER TABLE public.doctor_patient_messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.doctor_patient_chat_sessions ENABLE ROW LEVEL SECURITY;
