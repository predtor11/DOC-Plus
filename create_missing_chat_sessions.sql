-- CREATE CHAT SESSIONS FOR EXISTING PATIENTS
-- This will create chat sessions for patients who have user_ids but no chat sessions

DO $$
DECLARE
    patient_record RECORD;
    doctor_user_id TEXT;
    session_exists BOOLEAN;
BEGIN
    -- Loop through all patients who have user_ids
    FOR patient_record IN
        SELECT p.id, p.name, p.user_id, p.assigned_doctor_id
        FROM public.patients p
        WHERE p.user_id IS NOT NULL
        AND p.assigned_doctor_id IS NOT NULL
    LOOP
        -- Check if a chat session already exists
        SELECT EXISTS(
            SELECT 1 FROM public.chat_sessions
            WHERE session_type = 'doctor-patient'
            AND (
                (participant_1_id = patient_record.assigned_doctor_id AND participant_2_id = patient_record.user_id)
                OR
                (participant_1_id = patient_record.user_id AND participant_2_id = patient_record.assigned_doctor_id)
            )
        ) INTO session_exists;

        -- If no session exists, create one
        IF NOT session_exists THEN
            INSERT INTO public.chat_sessions (
                session_type,
                participant_1_id,
                participant_2_id,
                title,
                created_at,
                updated_at
            ) VALUES (
                'doctor-patient',
                patient_record.assigned_doctor_id,
                patient_record.user_id,
                'Chat with ' || patient_record.name,
                NOW(),
                NOW()
            );

            RAISE NOTICE 'Created chat session for patient: % (ID: %)', patient_record.name, patient_record.id;
        ELSE
            RAISE NOTICE 'Chat session already exists for patient: % (ID: %)', patient_record.name, patient_record.id;
        END IF;
    END LOOP;

    RAISE NOTICE 'Chat session creation process completed';
END $$;

-- Verify the results
SELECT '=== CHAT SESSIONS CREATED ===' as info;
SELECT
    COUNT(*) as total_chat_sessions,
    COUNT(CASE WHEN session_type = 'doctor-patient' THEN 1 END) as doctor_patient_sessions
FROM public.chat_sessions;

-- Show sessions with patient info
SELECT '=== DOCTOR-PATIENT CHAT SESSIONS ===' as info;
SELECT
    cs.id,
    cs.title,
    cs.participant_1_id as doctor_id,
    cs.participant_2_id as patient_id,
    p.name as patient_name,
    cs.created_at
FROM public.chat_sessions cs
LEFT JOIN public.patients p ON (
    p.user_id = cs.participant_1_id OR p.user_id = cs.participant_2_id
)
WHERE cs.session_type = 'doctor-patient'
ORDER BY cs.created_at DESC;
