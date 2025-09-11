import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://azjhqasjbrujfddbzxqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6amhxYXNqYnJ1amZkZGJ6eHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjQ1NjMsImV4cCI6MjA3MjMwMDU2M30.Pr0fbz79XckvUUKTi0CPvQWsIFqFEiP2r1PlezlJeOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMessageSendingFinal() {
  try {
    console.log('🧪 Final test: Message sending with updated code...');

    // Find an existing chat session
    const { data: sessions, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('session_type', 'doctor-patient')
      .limit(1);

    if (sessionError || !sessions || sessions.length === 0) {
      console.log('❌ No chat sessions found for testing');
      return;
    }

    const session = sessions[0];
    console.log('✅ Found session:', session.id);

    // Test message sending using the same structure as the updated ChatAPI
    const messageData = {
      session_id: session.id,
      sender_id: 'test-user-final',
      content: 'Final test message - should work now!',
      is_ai_message: false,
    };

    console.log('📨 Sending message with structure:', messageData);

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
      console.log('Message ID:', messageResult.id);
      console.log('Content:', messageResult.content);
    }

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testMessageSendingFinal();
