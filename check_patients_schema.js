import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://azjhqasjbrujfddbzxqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6amhxYXNqYnJ1amZkZGJ6eHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjQ1NjMsImV4cCI6MjA3MjMwMDU2M30.Pr0fbz79XckvUUKTi0CPvQWsIFqFEiP2r1PlezlJeOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPatientsTableSchema() {
  try {
    console.log('🔍 Checking patients table schema...');

    // Try to insert a test record with temp_password to see if the column exists
    const testData = {
      name: 'Test Patient Schema Check',
      email: 'test-schema-check@example.com',
      temp_password: 'test123',
      assigned_doctor_id: null,
      user_id: null
    };

    console.log('Testing insertion with temp_password column...');
    const { data, error } = await supabase
      .from('patients')
      .insert(testData)
      .select()
      .single();

    if (error) {
      console.log('❌ Error inserting with temp_password:', error.message);
      if (error.message.includes('temp_password')) {
        console.log('🔧 temp_password column does NOT exist in the database');
        console.log('📋 You need to apply the migration manually in Supabase Dashboard');
      }
    } else {
      console.log('✅ temp_password column exists!');
      console.log('🗑️ Cleaning up test record...');

      // Clean up the test record
      await supabase
        .from('patients')
        .delete()
        .eq('email', 'test-schema-check@example.com');
    }

  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

checkPatientsTableSchema();
