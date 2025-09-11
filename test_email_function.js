import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = 'https://azjhqasjbrujfddbzxqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub24iLCJpYXQiOjE3NTY3MjQ1NjMsImV4cCI6MjA3MjMwMDU2M30.Pr0fbz79XckvUUKTi0CPvQWsIFqFEiP2r1PlezlJeOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmailFunction() {
  console.log('Testing email function...');

  try {
    const { data, error } = await supabase.functions.invoke('send-temp-password', {
      body: {
        patientName: 'Test Patient',
        patientEmail: 'test@example.com',
        tempPassword: 'TestPass123!',
        doctorName: 'Dr. Test'
      }
    });

    if (error) {
      console.error('Email function error:', error);
      console.log('This is likely because:');
      console.log('1. RESEND_API_KEY is not set in Supabase secrets');
      console.log('2. The Edge Function is not deployed');
      console.log('3. Resend service is not configured');
    } else {
      console.log('Email function success:', data);
    }
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testEmailFunction();
