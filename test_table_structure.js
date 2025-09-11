import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://azjhqasjbrujfddbzxqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub24iLCJpYXQiOjE3NTY3MjQ1NjMsImV4cCI6MjA3MjMwMDU2M30.Pr0fbz79XckvUUKTi0CPvQWsIFqFEiP2r1PlezlJeOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  try {
    console.log('🔍 Checking table structure in detail...');

    // Try different column combinations to see what works
    console.log('\n📋 Testing different column structures...');

    // Test 1: Try with is_ai_message
    const testData1 = {
      session_id: 'a3ea7b31-f1f0-4f4d-9068-2e037bd30e8c', // Use a real UUID from our earlier test
      sender_id: 'test-sender-id',
      content: 'Test message with is_ai_message',
      is_ai_message: false
    };

    console.log('Test 1: Trying with is_ai_message column...');
    const { data: data1, error: error1 } = await supabase
      .from('doctor_patient_messages')
      .insert(testData1)
      .select()
      .single();

    if (error1) {
      console.error('❌ Test 1 failed:', error1.message);
    } else {
      console.log('✅ Test 1 successful with is_ai_message');
    }

    // Test 2: Try with is_read
    const testData2 = {
      session_id: 'a3ea7b31-f1f0-4f4d-9068-2e037bd30e8c',
      sender_id: 'test-sender-id',
      content: 'Test message with is_read',
      is_read: false
    };

    console.log('Test 2: Trying with is_read column...');
    const { data: data2, error: error2 } = await supabase
      .from('doctor_patient_messages')
      .insert(testData2)
      .select()
      .single();

    if (error2) {
      console.error('❌ Test 2 failed:', error2.message);
    } else {
      console.log('✅ Test 2 successful with is_read');
    }

    // Test 3: Try minimal columns
    const testData3 = {
      session_id: 'a3ea7b31-f1f0-4f4d-9068-2e037bd30e8c',
      sender_id: 'test-sender-id',
      content: 'Test message minimal'
    };

    console.log('Test 3: Trying with minimal columns...');
    const { data: data3, error: error3 } = await supabase
      .from('doctor_patient_messages')
      .insert(testData3)
      .select()
      .single();

    if (error3) {
      console.error('❌ Test 3 failed:', error3.message);
    } else {
      console.log('✅ Test 3 successful with minimal columns');
    }

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

checkTableStructure();
