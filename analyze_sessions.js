import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = 'https://azjhqasjbrujfddbzxqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6amhxYXNqYnJ1amZkZGJ6eHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjQ1NjMsImV4cCI6MjA3MjMwMDU2M30.Pr0fbz79XckvUUKTi0CPvQWsIFqFEiP2r1PlezlJeOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeUserSessions() {
  console.log('Analyzing user sessions and messages...');

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

    console.log(`Found ${sessions.length} doctor-patient sessions`);

    // Get all users from doctors and patients tables
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

    console.log(`Found ${doctors?.length || 0} doctors and ${patients?.length || 0} patients`);

    // Create a map of user_id to user info
    const userMap = new Map();

    doctors?.forEach(doctor => {
      userMap.set(doctor.user_id, { type: 'doctor', name: doctor.name, id: doctor.id });
    });

    patients?.forEach(patient => {
      userMap.set(patient.user_id, { type: 'patient', name: patient.name, id: patient.id });
    });

    // Analyze each session
    sessions.forEach((session, index) => {
      console.log(`\nSession ${index + 1}: ${session.id}`);
      console.log(`  Title: ${session.title}`);
      console.log(`  Created: ${session.created_at}`);

      const participant1 = userMap.get(session.participant_1_id);
      const participant2 = userMap.get(session.participant_2_id);

      console.log(`  Participant 1: ${session.participant_1_id} -> ${participant1 ? `${participant1.type}: ${participant1.name}` : 'Unknown'}`);
      console.log(`  Participant 2: ${session.participant_2_id} -> ${participant2 ? `${participant2.type}: ${participant2.name}` : 'Unknown'}`);

      // Check for messages in this session
      supabase
        .from('messages')
        .select('*')
        .eq('session_id', session.id)
        .then(({ data: messages, error }) => {
          if (error) {
            console.log(`  Messages: Error - ${error.message}`);
          } else {
            console.log(`  Messages: ${messages?.length || 0}`);
            if (messages && messages.length > 0) {
              messages.forEach((msg, msgIndex) => {
                const sender = userMap.get(msg.sender_id);
                console.log(`    ${msgIndex + 1}. ${msg.sender_id} -> ${sender ? `${sender.type}: ${sender.name}` : 'Unknown'}: ${msg.content}`);
              });
            }
          }
        });
    });

  } catch (error) {
    console.error('Analysis failed:', error);
  }
}

analyzeUserSessions();
