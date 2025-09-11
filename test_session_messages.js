import { createClient } from '@supabase/supabase-js';

// Supabase credentials from .env
const supabaseUrl = 'https://azjhqasjbrujfddbzxqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6amhxYXNqYnJ1amZkZGJ6eHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjQ1NjMsImV4cCI6MjA3MjMwMDU2M30.Pr0fbz79XckvUUKTi0CPvQWsIFqFEiP2r1PlezlJeOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSessionAndMessages() {
  console.log('Testing session and message fetching...');

  try {
    // Get all doctor-patient sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('session_type', 'doctor-patient')
      .order('created_at', { ascending: false });

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return;
    }

    console.log(`Found ${sessions.length} doctor-patient sessions:`);
    sessions.forEach((session, index) => {
      console.log(`${index + 1}. Session ID: ${session.id}`);
      console.log(`   Participants: ${session.participant_1_id} <-> ${session.participant_2_id}`);
      console.log(`   Title: ${session.title}`);
      console.log(`   Created: ${session.created_at}`);
      console.log('');
    });

    // For each session, check if there are messages
    for (const session of sessions) { // Check ALL sessions
      console.log(`Checking messages for session ${session.id}...`);

      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error(`Error fetching messages for session ${session.id}:`, messagesError);
      } else {
        if (messages.length > 0) {
          console.log(`Found ${messages.length} messages for session ${session.id}:`);
          messages.forEach((msg, index) => {
            console.log(`  ${index + 1}. ${msg.sender_id}: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`);
          });
        } else {
          console.log(`No messages for session ${session.id}`);
        }
      }
      console.log('');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSessionAndMessages();
