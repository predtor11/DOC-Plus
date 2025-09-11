// Comprehensive realtime test with detailed logging
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function comprehensiveTest() {
  console.log('🔬 Comprehensive Realtime Test\n');

  // Test 1: Basic connectivity
  console.log('1️⃣ Testing basic connectivity...');
  try {
    const { data, error } = await supabase.from('doctors').select('count', { count: 'exact', head: true });
    if (error) throw error;
    console.log('✅ Basic connectivity OK');
  } catch (err) {
    console.error('❌ Basic connectivity failed:', err.message);
    return;
  }

  // Test 2: Check if tables exist and are accessible
  console.log('\n2️⃣ Testing table accessibility...');
  const tables = ['messages', 'doctor_patient_messages'];
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
      if (error) throw error;
      console.log(`✅ ${table}: accessible (${data} records)`);
    } catch (err) {
      console.error(`❌ ${table}: ${err.message}`);
    }
  }

  // Test 3: Test realtime subscription with detailed logging
  console.log('\n3️⃣ Testing realtime subscriptions...');

  for (const table of tables) {
    console.log(`\n📡 Testing ${table} realtime...`);

    let eventReceived = false;
    let subscriptionStatus = 'UNKNOWN';

    const channel = supabase
      .channel(`test-${table}-${Date.now()}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: table
      }, (payload) => {
        console.log(`🎉 ${table} realtime event:`, payload);
        eventReceived = true;
      })
      .subscribe((status, err) => {
        subscriptionStatus = status;
        console.log(`📊 ${table} subscription status: ${status}`);

        if (err) {
          console.error(`❌ ${table} subscription error:`, err);
        }

        if (status === 'SUBSCRIBED') {
          console.log(`✅ ${table} successfully subscribed to realtime`);
        } else if (status === 'CHANNEL_ERROR') {
          console.log(`❌ ${table} channel error - realtime not configured`);
        } else if (status === 'TIMED_OUT') {
          console.log(`⏰ ${table} subscription timed out`);
        } else if (status === 'CLOSED') {
          console.log(`🔒 ${table} subscription closed`);
        }
      });

    // Wait 15 seconds for events
    await new Promise(resolve => setTimeout(resolve, 15000));

    console.log(`📋 ${table} test result:`, {
      eventReceived,
      subscriptionStatus,
      success: eventReceived && subscriptionStatus === 'SUBSCRIBED'
    });

    supabase.removeChannel(channel);
  }

  // Test 4: Try to insert a test message to trigger realtime
  console.log('\n4️⃣ Testing message insertion to trigger realtime...');

  try {
    // Try messages table
    const { data: msgData, error: msgError } = await supabase
      .from('messages')
      .insert({
        session_id: 'test-session-' + Date.now(),
        sender_id: 'test-user-' + Date.now(),
        content: 'Test message for realtime verification',
        message_type: 'user'
      })
      .select();

    if (msgError) {
      console.error('❌ Messages insertion error:', msgError);
    } else {
      console.log('✅ Messages insertion successful:', msgData[0]?.id);
    }
  } catch (err) {
    console.error('❌ Messages insertion exception:', err);
  }

  console.log('\n🏁 Test completed. Check the results above.');
}

// Run the test
comprehensiveTest().catch(console.error);
