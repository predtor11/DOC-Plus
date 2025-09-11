// Test real-time subscription manually
// Run this in browser console to test real-time connectivity

import { supabase } from './src/integrations/supabase/client.js';

console.log('🧪 Testing real-time subscription...');

// Test 1: Basic connection
supabase.from('doctor_patient_messages').select('count').limit(1)
  .then(result => {
    if (result.error) {
      console.error('❌ Connection failed:', result.error);
    } else {
      console.log('✅ Database connection successful');
    }
  });

// Test 2: Real-time subscription
const testChannel = supabase
  .channel('test-realtime')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'doctor_patient_messages'
  }, (payload) => {
    console.log('🎉 Real-time test successful! Received:', payload);
  })
  .subscribe((status, err) => {
    console.log('Test subscription status:', status);
    if (err) {
      console.error('❌ Test subscription error:', err);
    } else if (status === 'SUBSCRIBED') {
      console.log('✅ Real-time subscription working!');
    }
  });

// Clean up after 30 seconds
setTimeout(() => {
  console.log('🧪 Cleaning up test subscription');
  supabase.removeChannel(testChannel);
}, 30000);
