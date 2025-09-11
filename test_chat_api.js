import { ChatAPI } from './src/integrations/supabase/chat-api.js';

async function testChatAPIFunctions() {
  console.log('Testing ChatAPI functions...');

  const testDoctorId = 'E2788369-984a-410e-8f1f-90b77be6080b'; // Dr. Akshat barve
  const testPatientId = 'd1185878-f596-4708-a1fa-d68b207895be'; // Pratap Kumar

  try {
    // Test fetchDoctorPatientSession
    console.log('Testing fetchDoctorPatientSession...');
    const fetchResult = await ChatAPI.fetchDoctorPatientSession(testDoctorId, testPatientId);
    console.log('Fetch result:', fetchResult);

    if (fetchResult.data) {
      console.log('✅ Successfully fetched session:', fetchResult.data.id);
    } else {
      console.log('❌ No session found or error:', fetchResult.error);
    }

    // Test createDoctorPatientSession
    console.log('\nTesting createDoctorPatientSession...');
    const createResult = await ChatAPI.createDoctorPatientSession(testDoctorId, testPatientId, 'Test Session');
    console.log('Create result:', createResult);

    if (createResult.data) {
      console.log('✅ Successfully created/found session:', createResult.data.id);
      console.log('Session details:', {
        participants: `${createResult.data.participant_1_id} <-> ${createResult.data.participant_2_id}`,
        title: createResult.data.title
      });
    } else {
      console.log('❌ Failed to create session:', createResult.error);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testChatAPIFunctions();
