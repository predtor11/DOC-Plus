import { ChatAPI } from './integrations/supabase/chat-api.js';

async function testMessageSending() {
  try {
    console.log('Testing message sending...');

    // Test with a known session ID and user ID
    const testSessionId = 'test-session-id'; // You'll need to replace this with a real session ID
    const testSenderId = 'test-user-id'; // You'll need to replace this with a real user ID
    const testContent = 'Test message';

    console.log('Sending message with:', { testSessionId, testSenderId, testContent });

    const result = await ChatAPI.sendMessage(testSessionId, testContent, testSenderId, false);

    console.log('Result:', result);

    if (result.error) {
      console.error('Error details:', result.error);
    } else {
      console.log('Message sent successfully:', result.data);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMessageSending();
