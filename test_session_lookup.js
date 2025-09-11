import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = 'https://azjhqasjbrujfddbzxqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6amhxYXNqYnJ1amZkZGJ6eHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjQ1NjMsImV4cCI6MjA3MjMwMDU2M30.Pr0fbz79XckvUUKTi0CPvQWsIFqFEiP2r1PlezlJeOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSessionLookup() {
  console.log('Testing session lookup with correct user IDs...');

  try {
    // Get all doctors and patients to see the correct user IDs
    const { data: doctors, error: doctorsError } = await supabase
      .from('doctors')
      .select('id, user_id, name');

    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('id, user_id, name');

    if (doctorsError || patientsError) {
      console.error('Error fetching users:', doctorsError || patientsError);
      return;
    }

    console.log('Available doctors:');
    doctors?.forEach(doctor => {
      console.log(`  ${doctor.user_id} -> ${doctor.name}`);
    });

    console.log('Available patients:');
    patients?.forEach(patient => {
      console.log(`  ${patient.user_id} -> ${patient.name}`);
    });

    // Test session lookup for a specific doctor-patient pair that has messages
    // Use patient with user_id that has messages: d1185878-f596-4708-a1fa-d68b207895be (Pratap Kumar)
    const testDoctorId = 'E2788369-984a-410e-8f1f-90b77be6080b'; // Dr. Akshat barve
    const testPatientId = 'd1185878-f596-4708-a1fa-d68b207895be'; // Pratap Kumar

    console.log(`\nTesting session lookup for Doctor: ${testDoctorId}, Patient: ${testPatientId}`);

    // First, let's see all sessions for this doctor
    console.log('Checking all sessions for this doctor...');
    const { data: doctorSessions, error: doctorSessionsError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('session_type', 'doctor-patient')
      .or(`participant_1_id.eq.${testDoctorId},participant_2_id.eq.${testDoctorId}`)
      .order('created_at', { ascending: false });

    if (doctorSessionsError) {
      console.error('Error fetching doctor sessions:', doctorSessionsError);
    } else {
      console.log(`Found ${doctorSessions.length} sessions for doctor ${testDoctorId}:`);
      doctorSessions.forEach((session, index) => {
        console.log(`  ${index + 1}. ${session.id} - P1: ${session.participant_1_id}, P2: ${session.participant_2_id}`);
      });
    }

    // Now try different query approaches
    console.log('\nTrying different query approaches...');

    // Approach 1: Simple OR query
    console.log('Approach 1: Simple OR query');
    const { data: session1, error: error1 } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('session_type', 'doctor-patient')
      .or(`participant_1_id.eq.${testDoctorId},participant_2_id.eq.${testDoctorId}`)
      .or(`participant_1_id.eq.${testPatientId},participant_2_id.eq.${testPatientId}`)
      .maybeSingle();

    console.log('Approach 1 result:', session1 ? 'Found' : 'Not found', error1?.message);

    // Approach 2: Two separate queries
    console.log('Approach 2: Two separate queries');
    const { data: session2a } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('session_type', 'doctor-patient')
      .eq('participant_1_id', testDoctorId)
      .eq('participant_2_id', testPatientId)
      .maybeSingle();

    const { data: session2b } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('session_type', 'doctor-patient')
      .eq('participant_1_id', testPatientId)
      .eq('participant_2_id', testDoctorId)
      .maybeSingle();

    const session2 = session2a || session2b;
    console.log('Approach 2 result:', session2 ? 'Found' : 'Not found');

    // Use the found session
    const session = session2;
    const sessionError = null;
      console.log('✅ Found existing session:', session.id);
      console.log('Session details:', {
        participant_1: session.participant_1_id,
        participant_2: session.participant_2_id,
        title: session.title,
        created_at: session.created_at
      });

      // Check for messages in this session
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
      } else {
        console.log(`✅ Found ${messages.length} messages in session:`);
        messages.forEach((msg, index) => {
          console.log(`  ${index + 1}. ${msg.sender_id}: ${msg.content} (${msg.created_at})`);
        });
      }
    } else {
      console.log('❌ No existing session found for this doctor-patient pair');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSessionLookup();
