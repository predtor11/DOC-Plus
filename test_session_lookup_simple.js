import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = 'https://azjhqasjbrujfddbzxqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6amhxYXNqYnJ1amZkZGJ6eHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjQ1NjMsImV4cCI6MjA3MjMwMDU2M30.Pr0fbz79XckvUUKTi0CPvQWsIFqFEiP2r1PlezlJeOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSessionLookup() {
  console.log('Testing session lookup with correct user IDs...');

  try {
    // Test session lookup for a specific doctor-patient pair that has messages
    const testDoctorId = 'E2788369-984a-410e-8f1f-90b77be6080b'; // Dr. Akshat barve
    const testPatientId = 'd1185878-f596-4708-a1fa-d68b207895be'; // Pratap Kumar

    console.log(`Testing session lookup for Doctor: ${testDoctorId}, Patient: ${testPatientId}`);

    // Try two separate queries - this should work
    console.log('Query 1: Doctor as P1, Patient as P2');
    const { data: sessionA, error: errorA } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('participant_1_id', testDoctorId)
      .eq('participant_2_id', testPatientId)
      .maybeSingle();

    console.log('Query 1 result:', sessionA ? `Found session ${sessionA.id} (${sessionA.session_type})` : 'Not found', errorA?.message);

    console.log('Query 2: Patient as P1, Doctor as P2');
    const { data: sessionB, error: errorB } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('participant_1_id', testPatientId)
      .eq('participant_2_id', testDoctorId)
      .maybeSingle();

    console.log('Query 2 result:', sessionB ? `Found session ${sessionB.id} (${sessionB.session_type})` : 'Not found', errorB?.message);

    const session = sessionA || sessionB;

    if (session) {
      console.log('✅ Found existing session:', session.id);

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
          console.log(`  ${index + 1}. ${msg.sender_id}: ${msg.content}`);
        });
      }
    } else {
      console.log('❌ No existing session found');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSessionLookup();
