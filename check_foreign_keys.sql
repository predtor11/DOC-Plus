-- Check doctors table data to verify foreign key relationships
SELECT 'Doctors in database:' as info;
SELECT id, user_id, clerk_user_id, name FROM public.doctors;

-- Check if the assigned_doctor_id values from patients exist in doctors table
SELECT 'Checking foreign key relationships:' as info;

SELECT
    p.id as patient_id,
    p.name as patient_name,
    p.assigned_doctor_id,
    CASE
        WHEN d.user_id IS NOT NULL THEN 'VALID - Doctor exists'
        WHEN d.id IS NOT NULL THEN 'INVALID - Wrong ID type'
        ELSE 'INVALID - Doctor not found'
    END as status,
    d.name as doctor_name
FROM public.patients p
LEFT JOIN public.doctors d ON p.assigned_doctor_id = d.user_id
ORDER BY p.id;

-- Check for patients with null user_id
SELECT 'Patients with null user_id:' as info, COUNT(*) as count
FROM public.patients
WHERE user_id IS NULL;

-- Show detailed info about problematic records
SELECT 'Problematic patient records:' as info;
SELECT
    id,
    name,
    user_id,
    assigned_doctor_id,
    CASE WHEN user_id IS NULL THEN 'MISSING user_id' ELSE 'OK' END as user_id_status,
    CASE WHEN assigned_doctor_id IS NULL THEN 'MISSING doctor'
         WHEN NOT EXISTS (SELECT 1 FROM public.doctors WHERE user_id = assigned_doctor_id) THEN 'INVALID doctor'
         ELSE 'VALID doctor' END as doctor_status
FROM public.patients
WHERE user_id IS NULL OR assigned_doctor_id IS NULL
   OR NOT EXISTS (SELECT 1 FROM public.doctors WHERE user_id = assigned_doctor_id);
