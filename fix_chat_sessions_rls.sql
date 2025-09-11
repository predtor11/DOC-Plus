-- CHECK AND FIX RLS POLICIES FOR CHAT TABLES
-- This will check current policies and fix them to allow chat session creation

-- First, check current RLS policies on chat_sessions
SELECT '=== CURRENT CHAT_SESSIONS POLICIES ===' as info;
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'chat_sessions'
ORDER BY policyname;

-- Check if RLS is enabled
SELECT '=== RLS STATUS ===' as info;
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('chat_sessions', 'messages')
ORDER BY tablename;

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "chat_sessions_insert_policy" ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_select_policy" ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_update_policy" ON public.chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_delete_policy" ON public.chat_sessions;

-- Create permissive policies for chat_sessions
CREATE POLICY "chat_sessions_select_policy" ON public.chat_sessions
FOR SELECT USING (true);

CREATE POLICY "chat_sessions_insert_policy" ON public.chat_sessions
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "chat_sessions_update_policy" ON public.chat_sessions
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "chat_sessions_delete_policy" ON public.chat_sessions
FOR DELETE USING (auth.role() = 'authenticated');

-- Do the same for messages table
DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_select_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_update_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_delete_policy" ON public.messages;

CREATE POLICY "messages_select_policy" ON public.messages
FOR SELECT USING (true);

CREATE POLICY "messages_insert_policy" ON public.messages
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "messages_update_policy" ON public.messages
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "messages_delete_policy" ON public.messages
FOR DELETE USING (auth.role() = 'authenticated');

-- Ensure RLS is enabled
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Verify the policies were created
SELECT '=== UPDATED POLICIES ===' as info;
SELECT
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('chat_sessions', 'messages')
ORDER BY tablename, policyname;
