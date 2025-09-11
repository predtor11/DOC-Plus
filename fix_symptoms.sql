-- Nuclear option: Disable RLS, alter columns, re-enable RLS
-- Run this in Supabase SQL Editor

-- Step 1: Disable RLS on symptoms table
ALTER TABLE public.symptoms DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies on symptoms (should work now that RLS is disabled)
DROP POLICY IF EXISTS "Doctors can view all symptoms" ON public.symptoms;
DROP POLICY IF EXISTS "Doctors can create symptoms" ON public.symptoms;
DROP POLICY IF EXISTS "Doctors can update symptoms" ON public.symptoms;

-- Step 3: Check and alter user_id column if it exists
DO $$
DECLARE
    col_record record;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'symptoms'
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.symptoms ALTER COLUMN user_id TYPE text;
    RAISE NOTICE 'Successfully altered symptoms.user_id to text';
  ELSE
    RAISE NOTICE 'symptoms table does not have user_id column - checking all columns...';

    -- List all columns in symptoms table for debugging
    FOR col_record IN
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'symptoms'
    LOOP
        RAISE NOTICE 'Column: %, Type: %', col_record.column_name, col_record.data_type;
    END LOOP;
  END IF;
END $$;

-- Step 4: Re-enable RLS
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;

-- Step 5: Recreate policies
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

SELECT 'Symptoms table RLS disabled/altered/re-enabled successfully!' as status;
