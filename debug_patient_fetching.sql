-- DIAGNOSTIC SCRIPT: Debug patient fetching and doctor ID issues
-- Run this in Supabase SQL Editor to see what's happening

-- 1. Check what doctors exist and their user_ids
SELECT '=== DOCTORS IN SYSTEM ===' as info;
SELECT id, user_id, clerk_user_id, name, email, created_at
FROM public.doctors
ORDER BY created_at DESC;

-- 2. Check what patients exist and their assigned_doctor_id
SELECT '=== PATIENTS IN SYSTEM ===' as info;
SELECT id, name, user_id, assigned_doctor_id, email, created_at
FROM public.patients
ORDER BY created_at DESC;

-- 3. Check for ID mismatches - patients assigned to non-existent doctors
SELECT '=== PATIENTS WITH INVALID DOCTOR ASSIGNMENTS ===' as info;
SELECT
    p.id,
    p.name as patient_name,
    p.assigned_doctor_id,
    CASE WHEN d.user_id IS NULL THEN 'INVALID - Doctor not found'
         ELSE 'VALID - Doctor exists' END as status,
    d.name as doctor_name
FROM public.patients p
LEFT JOIN public.doctors d ON d.user_id = p.assigned_doctor_id
ORDER BY p.created_at DESC;

-- 4. Check chat sessions
SELECT '=== CHAT SESSIONS ===' as info;
SELECT
    cs.id,
    cs.session_type,
    cs.participant_1_id,
    cs.participant_2_id,
    cs.title,
    cs.created_at,
    CASE WHEN cs.participant_1_id = d.user_id THEN 'Doctor is participant_1'
         WHEN cs.participant_2_id = d.user_id THEN 'Doctor is participant_2'
         ELSE 'No doctor match' END as doctor_participation,
    p.name as patient_name
FROM public.chat_sessions cs
LEFT JOIN public.doctors d ON d.user_id = cs.participant_1_id OR d.user_id = cs.participant_2_id
LEFT JOIN public.patients p ON p.user_id = cs.participant_1_id OR p.user_id = cs.participant_2_id
WHERE cs.session_type = 'doctor-patient'
ORDER BY cs.created_at DESC;

-- 5. Summary
SELECT '=== SUMMARY ===' as info;
SELECT
    (SELECT COUNT(*) FROM public.doctors) as total_doctors,
    (SELECT COUNT(*) FROM public.patients) as total_patients,
    (SELECT COUNT(*) FROM public.patients WHERE user_id IS NOT NULL) as patients_with_user_id,
    (SELECT COUNT(*) FROM public.patients WHERE assigned_doctor_id IS NOT NULL) as patients_with_doctor_assignment,
    (SELECT COUNT(*) FROM public.chat_sessions WHERE session_type = 'doctor-patient') as doctor_patient_sessions;
