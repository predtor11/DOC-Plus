import { ChatAPI } from './src/integrations/supabase/chat-api.ts';

async function testChatAPIFixes() {
  try {
    console.log('🧪 Testing ChatAPI fixes...');

    // Test fetching a doctor-patient session (this should not cause 406 errors)
    console.log('\n📋 Testing fetchDoctorPatientSession...');
    const result = await ChatAPI.fetchDoctorPatientSession(
      'user_32VoA44OaYJxHEZdPKAlY0cYOJu', // doctor ID
      'test-patient-id' // patient ID
    );

    console.log('✅ fetchDoctorPatientSession result:', {
      success: !result.error,
      data: !!result.data,
      error: result.error?.message
    });

    // Test creating a doctor-patient session (this should not cause 406 errors)
    console.log('\n📝 Testing createDoctorPatientSession...');
    const createResult = await ChatAPI.createDoctorPatientSession(
      'user_32VoA44OaYJxHEZdPKAlY0cYOJu', // doctor ID
      'test-patient-id', // patient ID
      'Test Chat Session'
    );

    console.log('✅ createDoctorPatientSession result:', {
      success: !createResult.error,
      data: !!createResult.data,
      error: createResult.error?.message
    });

    console.log('\n🎉 All ChatAPI tests completed without 406 errors!');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testChatAPIFixes();
