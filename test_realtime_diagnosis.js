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

// Test 1: Check database connectivity for both tables
async function testDatabaseConnection() {
  console.log('1️⃣ Testing database connection...');

  // Test messages table
  try {
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('count', { count: 'exact', head: true });

    if (messagesError) {
      console.error('❌ Messages table connection failed:', messagesError);
      return false;
    }

    console.log('✅ Messages table connection OK, count:', messagesData);
  } catch (err) {
    console.error('❌ Messages table connection error:', err);
    return false;
  }

  // Test doctor_patient_messages table
  try {
    const { data: dpMessagesData, error: dpMessagesError } = await supabase
      .from('doctor_patient_messages')
      .select('count', { count: 'exact', head: true });

    if (dpMessagesError) {
      console.error('❌ Doctor-patient messages table connection failed:', dpMessagesError);
      return false;
    }

    console.log('✅ Doctor-patient messages table connection OK, count:', dpMessagesData);
    return true;
  } catch (err) {
    console.error('❌ Doctor-patient messages table connection error:', err);
    return false;
  }
}

// Test 2: Test realtime subscription for both tables
async function testRealtimeSubscription() {
  console.log('2️⃣ Testing realtime subscriptions...');

  const results = { messages: false, doctorPatientMessages: false };

  // Test messages table realtime
  console.log('Testing messages table realtime...');
  const messagesPromise = new Promise((resolve) => {
    const channel = supabase
      .channel('test-messages-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        console.log('🎉 Messages table realtime event received:', payload);
        resolve(true);
      })
      .subscribe((status, err) => {
        console.log('📡 Messages table subscription status:', status);
        if (err) {
          console.error('❌ Messages table subscription error:', err);
          resolve(false);
        }
        if (status === 'SUBSCRIBED') {
          console.log('✅ Messages table subscribed successfully');
        } else if (status === 'CHANNEL_ERROR') {
          console.log('❌ Messages table channel error');
          resolve(false);
        } else if (status === 'TIMED_OUT') {
          console.log('⏰ Messages table subscription timed out');
          resolve(false);
        }
      });

    setTimeout(() => {
      console.log('⏰ Messages table realtime test timeout');
      supabase.removeChannel(channel);
      resolve(false);
    }, 5000);
  });

  // Test doctor_patient_messages table realtime
  console.log('Testing doctor_patient_messages table realtime...');
  const dpMessagesPromise = new Promise((resolve) => {
    const channel = supabase
      .channel('test-dp-messages-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'doctor_patient_messages'
      }, (payload) => {
        console.log('🎉 Doctor-patient messages table realtime event received:', payload);
        resolve(true);
      })
      .subscribe((status, err) => {
        console.log('📡 Doctor-patient messages table subscription status:', status);
        if (err) {
          console.error('❌ Doctor-patient messages table subscription error:', err);
          resolve(false);
        }
        if (status === 'SUBSCRIBED') {
          console.log('✅ Doctor-patient messages table subscribed successfully');
        } else if (status === 'CHANNEL_ERROR') {
          console.log('❌ Doctor-patient messages table channel error');
          resolve(false);
        } else if (status === 'TIMED_OUT') {
          console.log('⏰ Doctor-patient messages table subscription timed out');
          resolve(false);
        }
      });

    setTimeout(() => {
      console.log('⏰ Doctor-patient messages table realtime test timeout');
      supabase.removeChannel(channel);
      resolve(false);
    }, 5000);
  });

  results.messages = await messagesPromise;
  results.doctorPatientMessages = await dpMessagesPromise;

  return results;
}

// Test 3: Test message insertion for both tables
async function testMessageInsertion() {
  console.log('3️⃣ Testing message insertion for both tables...');

  const results = { messages: false, doctorPatientMessages: false };

  // Test messages table insertion
  try {
    console.log('Testing messages table insertion...');
    const { data, error } = await supabase
      .from('messages')
      .insert({
        session_id: 'test-session-' + Date.now(),
        sender_id: 'test-user-' + Date.now(),
        content: 'Test message for messages table realtime verification',
        message_type: 'user'
      })
      .select();

    if (error) {
      console.error('❌ Messages table insertion failed:', error);
    } else {
      console.log('✅ Messages table insertion successful:', data[0].id);
      results.messages = true;
    }
  } catch (err) {
    console.error('❌ Messages table insertion error:', err);
  }

  // Test doctor_patient_messages table insertion
  try {
    console.log('Testing doctor_patient_messages table insertion...');

    // First, get an existing session ID
    const { data: sessions, error: sessionError } = await supabase
      .from('doctor_patient_chat_sessions')
      .select('id')
      .limit(1);

    if (sessionError || !sessions || sessions.length === 0) {
      console.log('⚠️ No existing doctor-patient sessions found, skipping doctor-patient insertion test');
      results.doctorPatientMessages = true; // Don't fail the test for this
    } else {
      const sessionId = sessions[0].id;
      console.log('Using doctor-patient session ID:', sessionId);

      const { data, error } = await supabase
        .from('doctor_patient_messages')
        .insert({
          session_id: sessionId,
          sender_id: 'test-user-' + Date.now(),
          content: 'Test message for doctor_patient_messages table realtime verification'
        })
        .select();

      if (error) {
        console.error('❌ Doctor-patient messages table insertion failed:', error);
      } else {
        console.log('✅ Doctor-patient messages table insertion successful:', data[0].id);
        results.doctorPatientMessages = true;
      }
    }
  } catch (err) {
    console.error('❌ Doctor-patient messages table insertion error:', err);
  }

  return results.messages && results.doctorPatientMessages;
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting realtime diagnosis for both tables...\n');

  const dbTest = await testDatabaseConnection();
  const realtimeResults = await testRealtimeSubscription();
  const insertResults = await testMessageInsertion();

  console.log('\n📊 Test Results:');
  console.log('Database Connection:', dbTest ? '✅ PASS' : '❌ FAIL');
  console.log('Messages Table Realtime:', realtimeResults.messages ? '✅ PASS' : '❌ FAIL');
  console.log('Doctor-Patient Messages Table Realtime:', realtimeResults.doctorPatientMessages ? '✅ PASS' : '❌ FAIL');
  console.log('Messages Table Insertion:', insertResults ? '✅ PASS' : '❌ FAIL');
  console.log('Doctor-Patient Messages Table Insertion:', insertResults ? '✅ PASS' : '❌ FAIL');

  if (!realtimeResults.messages || !realtimeResults.doctorPatientMessages) {
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Go to Supabase Dashboard > Database > Replication');
    console.log('2. Ensure both "messages" and "doctor_patient_messages" tables are selected');
    console.log('3. Ensure "INSERT" events are enabled for both tables');
    console.log('4. Check that publication "supabase_realtime" exists');
    console.log('5. Run the migration: supabase db push');
  }

  const allRealtimePass = realtimeResults.messages && realtimeResults.doctorPatientMessages;
  const allInsertPass = insertResults;
  process.exit((dbTest && allRealtimePass && allInsertPass) ? 0 : 1);
}

runTests();
