import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://azjhqasjbrujfddbzxqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6amhxYXNqYnJ1amZkZGJ6eHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjQ1NjMsImV4cCI6MjA3MjMwMDU2M30.Pr0fbz79XckvUUKTi0CPvQWsIFqFEiP2r1PlezlJeOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testChatSessionCreation() {
  try {
    console.log('🧪 Testing chat session creation...');

    // Test data - using real IDs from our previous check
    const doctorId = 'E2788369-984a-410e-8f1f-90b77be6080b'; // First doctor from our check
    const patientId = 'user_32VoA44OaYJxHEZdPKAlY0cYOJu'; // Example patient ID

    console.log('Test data:', { doctorId, patientId });

    // Test 1: Try creating in regular chat_sessions table
    console.log('\n📝 Test 1: Creating session in chat_sessions table...');
    const testData = {
      session_type: 'doctor-patient',
      participant_1_id: doctorId,
      participant_2_id: patientId,
      title: 'Test Doctor-Patient Chat',
    };

    const { data: sessionData, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert(testData)
      .select()
      .single();

    if (sessionError) {
      console.error('❌ Regular chat_sessions table error:', sessionError);
      console.log('Error code:', sessionError.code);
      console.log('Error message:', sessionError.message);
    } else {
      console.log('✅ Regular chat_sessions table works:', sessionData);
    }

    // Test 2: Try creating in doctor_patient_chat_sessions table
    console.log('\n📝 Test 2: Creating session in doctor_patient_chat_sessions table...');
    const doctorPatientData = {
      doctor_id: doctorId,
      patient_id: patientId,
      title: 'Test Doctor-Patient Chat',
    };

    const { data: dpData, error: dpError } = await supabase
      .from('doctor_patient_chat_sessions')
      .insert(doctorPatientData)
      .select()
      .single();

    if (dpError) {
      console.error('❌ Doctor-patient table error:', dpError);
      console.log('Error code:', dpError.code);
      console.log('Error message:', dpError.message);
    } else {
      console.log('✅ Doctor-patient table works:', dpData);
    }

    // Test 3: Check RLS status
    console.log('\n🔒 Test 3: Checking RLS status...');
    const { data: rlsData, error: rlsError } = await supabase
      .rpc('get_rls_status')
      .select('*');

    if (rlsError) {
      console.log('Could not check RLS status via RPC');
    } else {
      console.log('RLS status:', rlsData);
    }

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testChatSessionCreation();
