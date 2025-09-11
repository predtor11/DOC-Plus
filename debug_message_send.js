// Debug script to test message sending and realtime functionality
// This can be run in the browser console to test the chat functionality

console.log('=== Chat Debug Test ===');

// Test 1: Check if Supabase is available
if (typeof supabase === 'undefined') {
  console.error('❌ Supabase client not found');
} else {
  console.log('✅ Supabase client available');
}

// Test 2: Check current user
if (typeof useAuth === 'undefined') {
  console.log('⚠️ useAuth not available in global scope');
} else {
  console.log('✅ useAuth available');
}

// Test 3: Manual message insertion test
async function testMessageInsert(sessionId, content, senderId) {
  console.log('Testing manual message insert...');

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        sender_id: senderId,
        content: content,
        is_ai_message: false
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Message insert failed:', error);
      return null;
    }

    console.log('✅ Message inserted successfully:', data);
    return data;
  } catch (err) {
    console.error('❌ Message insert error:', err);
    return null;
  }
}

// Test 4: Manual realtime subscription test
function testRealtimeSubscription(sessionId) {
  console.log('Testing realtime subscription for session:', sessionId);

  const channel = supabase
    .channel(`debug-chat-${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => {
        console.log('🎉 DEBUG: Realtime message received!', payload);
        console.log('New message content:', payload.new.content);
        console.log('Sender ID:', payload.new.sender_id);
      }
    )
    .subscribe((status) => {
      console.log('DEBUG: Realtime subscription status:', status);
    });

  return channel;
}

// Make functions available globally for testing
window.testMessageInsert = testMessageInsert;
window.testRealtimeSubscription = testRealtimeSubscription;

// Usage instructions
console.log(`
=== Debug Functions Available ===
window.testMessageInsert(sessionId, content, senderId)
window.testRealtimeSubscription(sessionId)

Example usage:
1. Get a session ID from your chat
2. window.testRealtimeSubscription('your-session-id')
3. window.testMessageInsert('your-session-id', 'Test message', 'your-user-id')
4. Check console for realtime events
`);