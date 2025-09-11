-- FIX RLS POLICIES FOR CHAT TABLES
-- This script will create proper RLS policies for doctor-patient chat functionality

-- Step 1: Check current RLS status
SELECT '=== CURRENT RLS STATUS ===' as info;
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('doctor_patient_chat_sessions', 'doctor_patient_messages')
ORDER BY tablename;

-- Step 2: Drop existing policies for doctor_patient_chat_sessions if they exist
DROP POLICY IF EXISTS "doctor_patient_chat_sessions_select" ON public.doctor_patient_chat_sessions;
DROP POLICY IF EXISTS "doctor_patient_chat_sessions_insert" ON public.doctor_patient_chat_sessions;
DROP POLICY IF EXISTS "doctor_patient_chat_sessions_update" ON public.doctor_patient_chat_sessions;
DROP POLICY IF EXISTS "doctor_patient_chat_sessions_delete" ON public.doctor_patient_chat_sessions;

-- Step 3: Drop existing policies for doctor_patient_messages if they exist
DROP POLICY IF EXISTS "doctor_patient_messages_select" ON public.doctor_patient_messages;
DROP POLICY IF EXISTS "doctor_patient_messages_insert" ON public.doctor_patient_messages;
DROP POLICY IF EXISTS "doctor_patient_messages_update" ON public.doctor_patient_messages;
DROP POLICY IF EXISTS "doctor_patient_messages_delete" ON public.doctor_patient_messages;

-- Step 4: Create permissive policies for doctor_patient_chat_sessions
-- Allow anyone to read chat sessions (for now - you might want to restrict this later)
CREATE POLICY "doctor_patient_chat_sessions_select" ON public.doctor_patient_chat_sessions
FOR SELECT USING (true);

-- Allow authenticated users to create chat sessions
CREATE POLICY "doctor_patient_chat_sessions_insert" ON public.doctor_patient_chat_sessions
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update sessions they're part of
CREATE POLICY "doctor_patient_chat_sessions_update" ON public.doctor_patient_chat_sessions
FOR UPDATE USING (
    auth.jwt() ->> 'sub' = doctor_id OR
    auth.jwt() ->> 'sub' = patient_id
);

-- Allow users to delete sessions they're part of
CREATE POLICY "doctor_patient_chat_sessions_delete" ON public.doctor_patient_chat_sessions
FOR DELETE USING (
    auth.jwt() ->> 'sub' = doctor_id OR
    auth.jwt() ->> 'sub' = patient_id
);

-- Step 5: Create permissive policies for doctor_patient_messages
CREATE POLICY "doctor_patient_messages_select" ON public.doctor_patient_messages
FOR SELECT USING (true);

CREATE POLICY "doctor_patient_messages_insert" ON public.doctor_patient_messages
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "doctor_patient_messages_update" ON public.doctor_patient_messages
FOR UPDATE USING (auth.jwt() ->> 'sub' = sender_id);

CREATE POLICY "doctor_patient_messages_delete" ON public.doctor_patient_messages
FOR DELETE USING (auth.jwt() ->> 'sub' = sender_id);

-- Step 6: If the tables don't exist, create them
CREATE TABLE IF NOT EXISTS public.doctor_patient_chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.doctor_patient_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.doctor_patient_chat_sessions(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_ai_message BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Step 7: Enable RLS on the tables
ALTER TABLE public.doctor_patient_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_patient_messages ENABLE ROW LEVEL SECURITY;

-- Step 8: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doctor_patient_chat_sessions_doctor_id ON public.doctor_patient_chat_sessions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_patient_chat_sessions_patient_id ON public.doctor_patient_chat_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_doctor_patient_messages_session_id ON public.doctor_patient_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_doctor_patient_messages_sender_id ON public.doctor_patient_messages(sender_id);

-- Step 9: Verify the setup
SELECT '=== RLS POLICIES CREATED ===' as info;
SELECT
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('doctor_patient_chat_sessions', 'doctor_patient_messages')
ORDER BY tablename, policyname;
