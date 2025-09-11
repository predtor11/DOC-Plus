-- APPLY MISSING MIGRATION: Add clerk_user_id columns if they don't exist
-- Run this in Supabase SQL Editor if the clerk_user_id columns are missing

DO $$
BEGIN
  -- Add clerk_user_id column to doctors table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'doctors'
    AND column_name = 'clerk_user_id'
  ) THEN
    ALTER TABLE public.doctors ADD COLUMN clerk_user_id TEXT UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_doctors_clerk_user_id ON public.doctors(clerk_user_id);
    RAISE NOTICE 'Added clerk_user_id column to doctors table';
  ELSE
    RAISE NOTICE 'clerk_user_id column already exists in doctors table';
  END IF;

  -- Add clerk_user_id column to patients table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'patients'
    AND column_name = 'clerk_user_id'
  ) THEN
    ALTER TABLE public.patients ADD COLUMN clerk_user_id TEXT UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_patients_clerk_user_id ON public.patients(clerk_user_id);
    RAISE NOTICE 'Added clerk_user_id column to patients table';
  ELSE
    RAISE NOTICE 'clerk_user_id column already exists in patients table';
  END IF;

  -- Add email column to doctors table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'doctors'
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.doctors ADD COLUMN email TEXT;
    CREATE INDEX IF NOT EXISTS idx_doctors_email ON public.doctors(email);
    RAISE NOTICE 'Added email column to doctors table';
  END IF;

  -- Add email column to patients table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'patients'
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.patients ADD COLUMN email TEXT;
    CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);
    RAISE NOTICE 'Added email column to patients table';
  END IF;
END $$;

-- Update existing doctors to set clerk_user_id = user_id if clerk_user_id is null
UPDATE public.doctors
SET clerk_user_id = user_id
WHERE clerk_user_id IS NULL AND user_id IS NOT NULL;

-- Update existing patients to set clerk_user_id = user_id if clerk_user_id is null
UPDATE public.patients
SET clerk_user_id = user_id
WHERE clerk_user_id IS NULL AND user_id IS NOT NULL;

SELECT 'Migration completed successfully!' as status;
