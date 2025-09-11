import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://azjhqasjbrujfddbzxqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6amhxYXNqYnJ1amZkZGJ6eHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjQ1NjMsImV4cCI6MjA3MjMwMDU2M30.Pr0fbz79XckvUUKTi0CPvQWsIFqFEiP2r1PlezlJeOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCurrentChatStatus() {
  try {
    console.log('🔍 Checking current chat session creation status...');

    // Test data
    const doctorId = 'E2788369-984a-410e-8f1f-90b77be6080b';
    const patientId = 'user_32VoA44OaYJxHEZdPKAlY0cYOJu';

    console.log('Test data:', { doctorId, patientId });

    // Test 1: Check RLS status on chat_sessions
    console.log('\n🔒 Test 1: Checking RLS status...');
    try {
      const { data: rlsTest, error: rlsError } = await supabase
        .from('chat_sessions')
        .select('*')
        .limit(1);

      if (rlsError) {
        console.error('❌ RLS still blocking access to chat_sessions:', rlsError);
      } else {
        console.log('✅ Can access chat_sessions table');
      }
    } catch (err) {
      console.error('❌ Error accessing chat_sessions:', err.message);
    }

    // Test 2: Try creating a session directly
    console.log('\n📝 Test 2: Attempting to create chat session...');
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
      console.error('❌ Chat session creation failed:', sessionError);
      console.log('Error code:', sessionError.code);
      console.log('Error message:', sessionError.message);
    } else {
      console.log('✅ Chat session created successfully:', sessionData);
    }

    // Test 3: Check if we can access the table at all
    console.log('\n📊 Test 3: Checking table accessibility...');
    const { data: existingSessions, error: fetchError } = await supabase
      .from('chat_sessions')
      .select('*')
      .limit(5);

    if (fetchError) {
      console.error('❌ Cannot fetch from chat_sessions:', fetchError);
    } else {
      console.log('✅ Can fetch from chat_sessions, found', existingSessions?.length || 0, 'sessions');
    }

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testCurrentChatStatus();
