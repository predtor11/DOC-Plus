// Quick verification script - run after applying the migration
// This tests both tables without the complex timeout logic

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function quickTest() {
  console.log('🔍 Quick realtime verification...\n');

  // Test 1: Check table access
  try {
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('count', { count: 'exact', head: true });

    const { data: dpMessages, error: dpError } = await supabase
      .from('doctor_patient_messages')
      .select('count', { count: 'exact', head: true });

    console.log('✅ Messages table accessible:', messages !== null);
    console.log('✅ Doctor-patient messages table accessible:', dpMessages !== null);

    if (msgError) console.error('Messages error:', msgError);
    if (dpError) console.error('Doctor-patient messages error:', dpError);

  } catch (err) {
    console.error('❌ Table access error:', err);
    return;
  }

  // Test 2: Quick realtime subscription test (shorter timeout)
  console.log('\n📡 Testing realtime subscriptions (10s timeout)...');

  let messagesReceived = false;
  let dpMessagesReceived = false;

  const messagesChannel = supabase
    .channel('quick-test-messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
      console.log('🎉 Messages table realtime working!');
      messagesReceived = true;
    })
    .subscribe((status) => {
      console.log('Messages subscription status:', status);
    });

  const dpChannel = supabase
    .channel('quick-test-dp-messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'doctor_patient_messages' }, () => {
      console.log('🎉 Doctor-patient messages table realtime working!');
      dpMessagesReceived = true;
    })
    .subscribe((status) => {
      console.log('Doctor-patient messages subscription status:', status);
    });

  // Wait 10 seconds for realtime events
  setTimeout(async () => {
    console.log('\n📊 Results:');
    console.log('Messages realtime:', messagesReceived ? '✅ WORKING' : '❌ NOT WORKING');
    console.log('Doctor-patient messages realtime:', dpMessagesReceived ? '✅ WORKING' : '❌ NOT WORKING');

    if (messagesReceived && dpMessagesReceived) {
      console.log('\n🎉 Both tables are realtime-enabled! Doctor-patient chat should now work.');
    } else {
      console.log('\n⚠️  Realtime not working. Check Supabase dashboard or migration.');
    }

    // Cleanup
    supabase.removeChannel(messagesChannel);
    supabase.removeChannel(dpChannel);
    process.exit(messagesReceived && dpMessagesReceived ? 0 : 1);
  }, 10000);
}

quickTest();
