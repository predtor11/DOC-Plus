// Test script to verify Supabase Realtime functionality
// Run this in the browser console to test realtime subscriptions

// Test 1: Check Supabase client configuration
console.log('=== Supabase Realtime Test ===');
console.log('Supabase client:', window.supabase ? 'Available' : 'Not found');

// Test 2: Test basic realtime subscription
if (window.supabase) {
  console.log('Testing realtime subscription...');

  const testChannel = window.supabase
    .channel('test-channel')
    .on('broadcast', { event: 'test' }, (payload) => {
      console.log('Received broadcast:', payload);
    })
    .subscribe((status) => {
      console.log('Test channel status:', status);
    });

  // Test 3: Test database changes subscription (if you have a session ID)
  const testSessionId = 'your-session-id-here'; // Replace with actual session ID
  if (testSessionId !== 'your-session-id-here') {
    const messageChannel = window.supabase
      .channel(`test-messages-${testSessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `session_id=eq.${testSessionId}`,
        },
        (payload) => {
          console.log('Test: New message received:', payload);
        }
      )
      .subscribe((status) => {
        console.log('Test message channel status:', status);
      });
  }

  // Test 4: Send a test broadcast
  setTimeout(() => {
    testChannel.send({
      type: 'broadcast',
      event: 'test',
      payload: { message: 'Hello from test!', timestamp: new Date().toISOString() }
    });
  }, 2000);
} else {
  console.error('Supabase client not found. Make sure the app is loaded properly.');
}

// Instructions:
// 1. Open browser console (F12)
// 2. Run this script
// 3. Check for any errors
// 4. Send a message in the chat to see if realtime events are received