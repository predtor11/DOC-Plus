import { supabase } from './src/integrations/supabase/client.js';

async function testRealtimeSubscription() {
  console.log('🧪 Testing real-time subscription...');

  try {
    // Test basic connection
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('doctor_patient_messages').select('count').limit(1);
    if (error) {
      console.error('❌ Supabase connection error:', error);
      return;
    }
    console.log('✅ Supabase connection successful');

    // Test real-time subscription
    console.log('Setting up real-time subscription test...');
    const testChannel = supabase
      .channel('test-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'doctor_patient_messages',
        },
        (payload) => {
          console.log('🎉 Test real-time event received:', payload);
        }
      )
      .subscribe((status, err) => {
        console.log('Test subscription status:', status);
        if (err) {
          console.error('❌ Test subscription error:', err);
        } else if (status === 'SUBSCRIBED') {
          console.log('✅ Test subscription successful');
        }
      });

    // Wait a bit then clean up
    setTimeout(() => {
      console.log('Cleaning up test subscription...');
      supabase.removeChannel(testChannel);
      console.log('🧪 Real-time test completed');
    }, 10000);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRealtimeSubscription();
