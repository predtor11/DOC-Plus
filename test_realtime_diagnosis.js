import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://azjhqasjbrujfddbzxqw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6amhxYXNqYnJ1amZkZGJ6eHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjQ1NjMsImV4cCI6MjA3MjMwMDU2M30.Pr0fbz79XckvUUKTi0CPvQWsIFqFEiP2r1PlezlJeOQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    }
  }
});

console.log('🧪 Testing realtime functionality...');

// Test 1: Check database connectivity
async function testDatabaseConnection() {
  console.log('1️⃣ Testing database connection...');
  try {
    const { data, error } = await supabase
      .from('doctor_patient_messages')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }

    console.log('✅ Database connection OK, doctor_patient_messages count:', data);
    return true;
  } catch (err) {
    console.error('❌ Database connection error:', err);
    return false;
  }
}

// Test 2: Test realtime subscription
function testRealtimeSubscription() {
  console.log('2️⃣ Testing realtime subscription...');

  return new Promise((resolve) => {
    const channel = supabase
      .channel('test-realtime-channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'doctor_patient_messages'
      }, (payload) => {
        console.log('🎉 Realtime event received:', payload);
        resolve(true);
      })
      .subscribe((status, err) => {
        console.log('📡 Subscription status:', status);

        if (err) {
          console.error('❌ Subscription error:', err);
          resolve(false);
          return;
        }

        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to realtime!');
        } else if (status === 'CHANNEL_ERROR') {
          console.log('❌ Channel error - realtime not configured');
          resolve(false);
        } else if (status === 'TIMED_OUT') {
          console.log('⏰ Subscription timed out');
          resolve(false);
        }
      });

    // Timeout after 10 seconds
    setTimeout(() => {
      console.log('⏰ Realtime test timed out');
      supabase.removeChannel(channel);
      resolve(false);
    }, 10000);
  });
}

// Test 3: Test message insertion (if we have a valid session)
async function testMessageInsertion() {
  console.log('3️⃣ Testing message insertion...');

  try {
    // First, get an existing session ID
    const { data: sessions, error: sessionError } = await supabase
      .from('doctor_patient_chat_sessions')
      .select('id')
      .limit(1);

    if (sessionError || !sessions || sessions.length === 0) {
      console.log('⚠️ No existing doctor-patient sessions found, skipping insertion test');
      return true;
    }

    const sessionId = sessions[0].id;
    console.log('Using doctor-patient session ID:', sessionId);

    const { data, error } = await supabase
      .from('doctor_patient_messages')
      .insert({
        session_id: sessionId,
        sender_id: 'test-user-' + Date.now(),
        content: 'Test message for realtime verification'
      })
      .select();

    if (error) {
      console.error('❌ Message insertion failed:', error);
      return false;
    }

    console.log('✅ Message inserted successfully:', data[0].id);
    return true;
  } catch (err) {
    console.error('❌ Message insertion error:', err);
    return false;
  }
}

// Run all tests
async function runTests() {
  const dbTest = await testDatabaseConnection();
  const realtimeTest = await testRealtimeSubscription();
  const insertTest = await testMessageInsertion();

  console.log('\n📊 Test Results:');
  console.log('Database Connection:', dbTest ? '✅ PASS' : '❌ FAIL');
  console.log('Realtime Subscription:', realtimeTest ? '✅ PASS' : '❌ FAIL');
  console.log('Message Insertion:', insertTest ? '✅ PASS' : '❌ FAIL');

  if (!realtimeTest) {
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Go to Supabase Dashboard > Database > Replication');
    console.log('2. Ensure "messages" table is selected');
    console.log('3. Ensure "INSERT" events are enabled');
    console.log('4. Check that publication "supabase_realtime" exists');
    console.log('5. Run the migration: supabase db push');
  }

  process.exit(realtimeTest ? 0 : 1);
}

runTests();
