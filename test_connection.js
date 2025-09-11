// Simple database connection test
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing basic database connection...\n');

  try {
    // Test basic connection
    const { data, error } = await supabase.from('doctors').select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      console.log('💡 This might indicate:');
      console.log('   - RLS policies blocking access');
      console.log('   - Table doesn\'t exist');
      console.log('   - Authentication issues');
      return false;
    }

    console.log('✅ Database connection successful');
    console.log('✅ Doctors table accessible, count:', data);

    // Test messages table
    const { data: msgData, error: msgError } = await supabase
      .from('messages')
      .select('count', { count: 'exact', head: true });

    if (msgError) {
      console.error('❌ Messages table error:', msgError.message);
    } else {
      console.log('✅ Messages table accessible, count:', msgData);
    }

    // Test doctor_patient_messages table
    const { data: dpData, error: dpError } = await supabase
      .from('doctor_patient_messages')
      .select('count', { count: 'exact', head: true });

    if (dpError) {
      console.error('❌ Doctor-patient messages table error:', dpError.message);
    } else {
      console.log('✅ Doctor-patient messages table accessible, count:', dpData);
    }

    return true;

  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
    return false;
  }
}

testConnection();
