import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://azjhqasjbrujfddbzxqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6amhxYXNqYnJ1amZkZGJ6eHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjQ1NjMsImV4cCI6MjA3MjMwMDU2M30.Pr0fbz79XckvUUKTi0CPvQWsIFqFEiP2r1PlezlJeOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMessageFetching() {
  try {
    console.log('🧪 Testing message fetching...');

    // First, check what chat sessions exist
    console.log('\n📋 Checking chat sessions...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('*')
      .limit(10);

    if (sessionsError) {
      console.error('❌ Error fetching sessions:', sessionsError);
      return;
    }

    console.log('✅ Found sessions:', sessions?.length || 0);
    if (sessions && sessions.length > 0) {
      sessions.forEach((session, index) => {
        console.log(`Session ${index + 1}:`, {
          id: session.id,
          type: session.session_type,
          participant1: session.participant_1_id,
          participant2: session.participant_2_id,
          title: session.title
        });
      });

      // Try to fetch messages for the first session
      const firstSession = sessions[0];
      console.log('\n📨 Testing message fetch for session:', firstSession.id);

      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', firstSession.id)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('❌ Error fetching messages:', messagesError);
      } else {
        console.log('✅ Messages fetched successfully:', messages?.length || 0, 'messages');
        if (messages && messages.length > 0) {
          messages.forEach((message, index) => {
            console.log(`Message ${index + 1}:`, {
              id: message.id,
              sender: message.sender_id,
              content: message.content?.substring(0, 50) + '...',
              created: message.created_at
            });
          });
        }
      }
    } else {
      console.log('⚠️ No chat sessions found. Try creating some messages first.');
    }

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testMessageFetching();
