// Test script for patient invitation flow
// Run this with: node test_patient_invitation.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPatientInvitation() {
  console.log('🧪 Testing patient invitation flow...');

  try {
    // Test the invite-patient function
    const { data, error } = await supabase.functions.invoke('invite-patient', {
      body: {
        patientEmail: 'test-patient@example.com',
        patientName: 'Test Patient',
        doctorName: 'Dr. Test',
        doctorId: 'test-doctor-id'
      }
    });

    if (error) {
      console.error('❌ Invitation failed:', error);
      return;
    }

    console.log('✅ Invitation created:', data);

    // Check if patient record was created
    const { data: patients, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('email', 'test-patient@example.com');

    if (patientError) {
      console.error('❌ Error checking patient record:', patientError);
      return;
    }

    console.log('📋 Patient record:', patients);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPatientInvitation();
