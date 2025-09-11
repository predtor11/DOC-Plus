import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://azjhqasjbrujfddbzxqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6amhxYXNqYnJ1amZkZGJ6eHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjQ1NjMsImV4cCI6MjA3MjMwMDU2M30.Pr0fbz79XckvUUKTi0CPvQWsIFqFEiP2r1PlezlJeOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDoctorPatientTables() {
  try {
    console.log('🔍 Checking doctor-patient tables structure...');

    // Check if doctor_patient_messages table exists
    console.log('\n📋 Checking if doctor_patient_messages table exists...');
    const { data: messagesData, error: messagesError } = await supabase
      .from('doctor_patient_messages')
      .select('*')
      .limit(1);

    if (messagesError) {
      console.error('❌ doctor_patient_messages table error:', messagesError);
      console.log('Error code:', messagesError.code);
      console.log('Error message:', messagesError.message);
    } else {
      console.log('✅ doctor_patient_messages table exists');
      console.log('Sample data:', messagesData);
    }

    // Check if doctor_patient_chat_sessions table exists
    console.log('\n📋 Checking if doctor_patient_chat_sessions table exists...');
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('doctor_patient_chat_sessions')
      .select('*')
      .limit(1);

    if (sessionsError) {
      console.error('❌ doctor_patient_chat_sessions table error:', sessionsError);
      console.log('Error code:', sessionsError.code);
      console.log('Error message:', sessionsError.message);
    } else {
      console.log('✅ doctor_patient_chat_sessions table exists');
      console.log('Sample data:', sessionsData);
    }

    // Try to insert a test message with the correct structure
    console.log('\n📝 Testing message insertion with correct structure...');
    const testMessageData = {
      session_id: 'test-session-id',
      sender_id: 'test-sender-id',
      content: 'Test message',
      is_read: false
    };

    const { data: insertData, error: insertError } = await supabase
      .from('doctor_patient_messages')
      .insert(testMessageData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
      console.log('Error code:', insertError.code);
      console.log('Error message:', insertError.message);
    } else {
      console.log('✅ Insert test successful:', insertData);
    }

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

checkDoctorPatientTables();
