-- Enable real-time for chat tables
-- This ensures that real-time subscriptions work properly for chat messages

-- Enable real-time for the doctor_patient_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.doctor_patient_messages;

-- Also ensure the doctor_patient_chat_sessions table is enabled for real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.doctor_patient_chat_sessions;
