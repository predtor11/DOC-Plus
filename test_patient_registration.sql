-- TEST PATIENT REGISTRATION: Verify the fix is working
-- Run this after registering a new patient to check if everything is set up correctly

-- 1. Check the most recently registered patient
SELECT '=== MOST RECENT PATIENT ===' as info;
SELECT
    p.id,
    p.name,
    p.user_id,
    p.assigned_doctor_id,
    p.email,
    p.created_at,
    CASE WHEN p.user_id IS NOT NULL THEN '✅ Has user_id'
         ELSE '❌ Missing user_id' END as user_id_status,
    CASE WHEN p.assigned_doctor_id IS NOT NULL THEN '✅ Has doctor assignment'
         ELSE '❌ Missing doctor assignment' END as doctor_assignment_status,
    CASE WHEN d.user_id IS NOT NULL THEN '✅ Doctor exists'
         ELSE '❌ Doctor not found' END as doctor_exists_status,
    d.name as assigned_doctor_name
FROM public.patients p
LEFT JOIN public.doctors d ON d.user_id = p.assigned_doctor_id
ORDER BY p.created_at DESC
LIMIT 1;

-- 2. Check if a chat session was created for this patient
SELECT '=== CHAT SESSION FOR NEW PATIENT ===' as info;
SELECT
    cs.id,
    cs.session_type,
    cs.participant_1_id,
    cs.participant_2_id,
    cs.title,
    cs.created_at,
    CASE WHEN cs.participant_1_id = p.user_id OR cs.participant_2_id = p.user_id THEN '✅ Session exists'
         ELSE '❌ No session found' END as session_status
FROM public.patients p
CROSS JOIN public.chat_sessions cs
WHERE cs.session_type = 'doctor-patient'
  AND (cs.participant_1_id = p.user_id OR cs.participant_2_id = p.user_id)
  AND p.created_at >= NOW() - INTERVAL '1 hour'  -- Only check recent patients
ORDER BY cs.created_at DESC
LIMIT 1;

-- 3. Overall system health check
SELECT '=== SYSTEM HEALTH CHECK ===' as info;
SELECT
    'Total doctors: ' || (SELECT COUNT(*) FROM public.doctors) as doctors,
    'Total patients: ' || (SELECT COUNT(*) FROM public.patients) as patients,
    'Patients with user_id: ' || (SELECT COUNT(*) FROM public.patients WHERE user_id IS NOT NULL) as patients_with_user_id,
    'Patients with doctor assignment: ' || (SELECT COUNT(*) FROM public.patients WHERE assigned_doctor_id IS NOT NULL) as patients_with_doctor,
    'Valid doctor assignments: ' || (
        SELECT COUNT(*)
        FROM public.patients p
        WHERE p.assigned_doctor_id IS NOT NULL
          AND EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = p.assigned_doctor_id)
    ) as valid_assignments,
    'Chat sessions: ' || (SELECT COUNT(*) FROM public.chat_sessions WHERE session_type = 'doctor-patient') as chat_sessions;
