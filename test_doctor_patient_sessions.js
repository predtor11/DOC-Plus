import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://azjhqasjbrujfddbzxqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6amhxYXNqYnJ1amZkZGJ6eHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjQ1NjMsImV4cCI6MjA3MjMwMDU2M30.Pr0fbz79XckvUUKTi0CPvQWsIFqFEiP2r1PlezlJeOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDoctorPatientSessions() {
  try {
    console.log('🧪 Testing doctor-patient chat sessions...');

    // Check for doctor-patient sessions specifically
    console.log('\n📋 Checking doctor-patient sessions...');
    const { data: dpSessions, error: dpError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('session_type', 'doctor-patient');

    if (dpError) {
      console.error('❌ Error fetching doctor-patient sessions:', dpError);
      return;
    }

    console.log('✅ Found doctor-patient sessions:', dpSessions?.length || 0);

    if (dpSessions && dpSessions.length > 0) {
      dpSessions.forEach((session, index) => {
        console.log(`DP Session ${index + 1}:`, {
          id: session.id,
          participant1: session.participant_1_id,
          participant2: session.participant_2_id,
          title: session.title,
          created: session.created_at
        });
      });

      // Try to fetch messages for the first doctor-patient session
      const firstDPSession = dpSessions[0];
      console.log('\n📨 Testing message fetch for DP session:', firstDPSession.id);

      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', firstDPSession.id)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('❌ Error fetching DP messages:', messagesError);
      } else {
        console.log('✅ DP Messages fetched successfully:', messages?.length || 0, 'messages');
        if (messages && messages.length > 0) {
          messages.forEach((message, index) => {
            console.log(`DP Message ${index + 1}:`, {
              id: message.id,
              sender: message.sender_id,
              content: message.content?.substring(0, 50) + '...',
              created: message.created_at
            });
          });
        } else {
          console.log('⚠️ No messages found for this doctor-patient session');
        }
      }
    } else {
      console.log('⚠️ No doctor-patient sessions found. You may need to create one first.');
      console.log('💡 Try accessing the chat from a patient or doctor account to create sessions.');
    }

    // Also check what users exist
    console.log('\n👥 Checking users in the system...');
    const { data: doctors } = await supabase
      .from('doctors')
      .select('user_id, name')
      .limit(5);

    const { data: patients } = await supabase
      .from('patients')
      .select('user_id, name')
      .limit(5);

    console.log('Doctors:', doctors?.length || 0);
    console.log('Patients:', patients?.length || 0);

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testDoctorPatientSessions();
