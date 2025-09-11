// Comprehensive browser test for Supabase Realtime Chat functionality
// Run this in the browser console after opening the chat

console.log('🚀 === Supabase Realtime Chat Test ===');

// Test 1: Check Supabase client
if (typeof supabase === 'undefined') {
  console.error('❌ Supabase client not found. Make sure the app is loaded.');
  console.log('💡 Try refreshing the page and running this test again.');
} else {
  console.log('✅ Supabase client available');
}

// Test 2: Check authentication
const checkAuth = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('❌ Auth error:', error);
      return null;
    }
    console.log('✅ User authenticated:', user?.id);
    return user;
  } catch (err) {
    console.error('❌ Auth check failed:', err);
    return null;
  }
};

// Test 3: Test realtime connection
const testRealtimeConnection = () => {
  console.log('🔄 Testing realtime connection...');

  const testChannel = supabase
    .channel('connection-test')
    .on('broadcast', { event: 'ping' }, (payload) => {
      console.log('📡 Realtime working! Received:', payload);
    })
    .subscribe((status) => {
      console.log('📊 Connection status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Realtime connection successful');

        // Send a test message
        setTimeout(() => {
          testChannel.send({
            type: 'broadcast',
            event: 'ping',
            payload: { message: 'Hello from browser test!', timestamp: Date.now() }
          });
        }, 1000);
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Realtime connection failed');
      }
    });

  return testChannel;
};

// Test 4: Test message subscription (requires session ID)
const testMessageSubscription = (sessionId) => {
  if (!sessionId) {
    console.log('⚠️ No session ID provided. Get one from your chat URL or database.');
    return null;
  }

  console.log('📨 Testing message subscription for session:', sessionId);

  const messageChannel = supabase
    .channel(`test-messages-${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => {
        console.log('🎉 NEW MESSAGE RECEIVED!');
        console.log('📝 Content:', payload.new.content);
        console.log('👤 Sender:', payload.new.sender_id);
        console.log('🕒 Time:', payload.new.created_at);
        console.log('📦 Full payload:', payload);
      }
    )
    .subscribe((status) => {
      console.log('📊 Message subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Successfully subscribed to message updates');
        console.log('💡 Now send a message in the chat to test realtime delivery');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Message subscription failed');
        console.log('🔍 Possible issues:');
        console.log('   - Messages table not enabled for realtime');
        console.log('   - Session ID is incorrect');
        console.log('   - Database permissions issue');
      }
    });

  return messageChannel;
};

// Test 5: Manual message send test
const testMessageSend = async (sessionId, content, senderId) => {
  if (!sessionId || !content || !senderId) {
    console.error('❌ Missing required parameters: sessionId, content, senderId');
    return null;
  }

  console.log('📤 Testing manual message send...');

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
      console.error('❌ Message send failed:', error);
      return null;
    }

    console.log('✅ Message sent successfully:', data);
    console.log('💡 Check if this message appears in realtime above');
    return data;
  } catch (err) {
    console.error('❌ Message send error:', err);
    return null;
  }
};

// Make functions globally available
window.testRealtimeConnection = testRealtimeConnection;
window.testMessageSubscription = testMessageSubscription;
window.testMessageSend = testMessageSend;
window.checkAuth = checkAuth;

// Auto-run basic tests
console.log(`
=== Quick Test Commands ===
1. window.checkAuth() - Check if user is authenticated
2. window.testRealtimeConnection() - Test basic realtime connection
3. window.testMessageSubscription('your-session-id') - Test message subscription
4. window.testMessageSend('session-id', 'Test message', 'user-id') - Send test message

=== Step-by-Step Testing ===
1. Run: window.checkAuth()
2. Run: window.testRealtimeConnection()
3. Get session ID from chat URL or database
4. Run: window.testMessageSubscription('your-session-id')
5. Send a message in the chat or run testMessageSend()
6. Check console for realtime events

=== Troubleshooting ===
- If realtime doesn't work, check Supabase dashboard > Database > Replication
- Ensure 'messages' table has 'Insert' event enabled
- Check browser network tab for WebSocket connections
- Verify session ID is correct
`);

// Auto-run connection test
setTimeout(() => {
  if (typeof supabase !== 'undefined') {
    window.testRealtimeConnection();
  }
}, 1000);