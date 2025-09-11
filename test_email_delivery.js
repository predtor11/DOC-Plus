import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://azjhqasjbrujfddbzxqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6amhxYXNqYnJ1amZkZGJ6eHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjQ1NjMsImV4cCI6MjA3MjMwMDU2M30.Pr0fbz79XckvUUKTi0CPvQWsIFqFEiP2r1PlezlJeOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmailFunction() {
  try {
    console.log('🧪 Testing send-temp-password Edge Function...');

    const testData = {
      patientName: 'Test Patient',
      patientEmail: 'barveakshat091@gmail.com', // Use your account email for testing
      tempPassword: 'test123456',
      doctorName: 'Dr. Test'
    };

    console.log('Sending test email to:', testData.patientEmail);

    const { data, error } = await supabase.functions.invoke('send-temp-password', {
      body: testData
    });

    if (error) {
      console.error('❌ Function call failed:', error);
    } else {
      console.log('✅ Function call successful!');
      console.log('Response:', data);
    }

  } catch (error) {
    console.error('Error testing function:', error);
  }
}

// Instructions for the user
console.log('📧 EMAIL DELIVERY TROUBLESHOOTING:');
console.log('');
console.log('1. Check your spam/junk folder for the email');
console.log('2. Verify the email address is correct');
console.log('3. Check if your domain is verified in Resend dashboard');
console.log('4. For production, use your own domain instead of onboarding@resend.dev');
console.log('');
console.log('🔧 To fix the "from" address for production:');
console.log('   - Go to https://resend.com/domains');
console.log('   - Add and verify your domain (e.g., mail.yourdomain.com)');
console.log('   - Update the Edge Function to use: from: "noreply@yourdomain.com"');
console.log('');
console.log('🧪 Testing function call...');

testEmailFunction();
