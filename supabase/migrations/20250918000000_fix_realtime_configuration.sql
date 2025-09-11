-- Fix realtime configuration for messages table
-- This migration ensures proper realtime setup

-- Drop existing publication if it exists
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Create new publication for realtime
CREATE PUBLICATION supabase_realtime FOR TABLE messages;

-- Enable realtime for the messages table
-- This should be done through the Supabase dashboard, but we'll document it here

-- Alternative approach: Use the supabase_realtime publication
-- Note: The publication name must be exactly 'supabase_realtime' for Supabase to recognize it

-- Verify the publication was created
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        RAISE NOTICE 'supabase_realtime publication exists';
    ELSE
        RAISE EXCEPTION 'Failed to create supabase_realtime publication';
    END IF;
END $$;

-- Add the messages table to the publication
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Verify the table was added
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'messages'
    ) THEN
        RAISE NOTICE 'messages table successfully added to supabase_realtime publication';
    ELSE
        RAISE EXCEPTION 'Failed to add messages table to publication';
    END IF;
END $$;

-- Note: After running this migration, you may need to:
-- 1. Go to Supabase Dashboard > Database > Replication
-- 2. Ensure the messages table is selected
-- 3. Ensure INSERT events are enabled
-- 4. Restart the realtime service if necessary
