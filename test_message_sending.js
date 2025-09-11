import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://azjhqasjbrujfddbzxqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6amhxYXNqYnJ1amZkZGJ6eHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjQ1NjMsImV4cCI6MjA3MjMwMDU2M30.Pr0fbz79XckvUUKTi0CPvQWsIFqFEiP2r1PlezlJeOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMessageSending() {
  try {
    console.log('🧪 Testing message sending...');

    // First, let's see if we can find an existing chat session
    console.log('\n📝 Finding existing chat session...');
    const { data: sessions, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('session_type', 'doctor-patient')
      .limit(1);

    if (sessionError) {
      console.error('❌ Error finding sessions:', sessionError);
      return;
    }

    if (!sessions || sessions.length === 0) {
      console.log('❌ No chat sessions found. Please create a chat session first.');
      return;
    }

    const session = sessions[0];
    console.log('✅ Found session:', session.id);

    // Test sending a message to the regular messages table
    console.log('\n📨 Testing message send to messages table...');
    const messageData = {
      session_id: session.id,
      sender_id: 'test-user-id',
      content: 'Test message from diagnostic script',
      is_read: false
    };

    const { data: messageResult, error: messageError } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (messageError) {
      console.error('❌ Message send failed:', messageError);
      console.log('Error code:', messageError.code);
      console.log('Error message:', messageError.message);
    } else {
      console.log('✅ Message sent successfully:', messageResult);
    }

    // Test sending to doctor_patient_messages table
    console.log('\n📨 Testing message send to doctor_patient_messages table...');
    const dpMessageData = {
      session_id: session.id,
      sender_id: 'test-user-id',
      content: 'Test message to doctor_patient_messages',
      is_read: false
    };

    const { data: dpMessageResult, error: dpMessageError } = await supabase
      .from('doctor_patient_messages')
      .insert(dpMessageData)
      .select()
      .single();

    if (dpMessageError) {
      console.error('❌ Doctor-patient message send failed:', dpMessageError);
      console.log('Error code:', dpMessageError.code);
      console.log('Error message:', dpMessageError.message);
    } else {
      console.log('✅ Doctor-patient message sent successfully:', dpMessageResult);
    }

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testMessageSending();
