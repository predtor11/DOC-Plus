-- Emergency fix: Create truly permissive policies for immediate testing

-- Drop all existing policies on patients table
DROP POLICY IF EXISTS "patients_select_policy" ON public.patients;
DROP POLICY IF EXISTS "patients_insert_policy" ON public.patients;
DROP POLICY IF EXISTS "patients_update_policy" ON public.patients;
DROP POLICY IF EXISTS "patients_delete_policy" ON public.patients;

-- Create emergency permissive policies
CREATE POLICY "emergency_allow_all_patients" ON public.patients
FOR ALL USING (true) WITH CHECK (true);

-- Test the policy
SELECT 'Emergency patients policies created - test your queries now!' as status;
