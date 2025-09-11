import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://azjhqasjbrujfddbzxqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6amhxYXNqYnJ1amZkZGJ6eHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjQ1NjMsImV4cCI6MjA3MjMwMDU2M30.Pr0fbz79XckvUUKTi0CPvQWsIFqFEiP2r1PlezlJeOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDoctorsTable() {
  try {
    console.log('🔍 Checking doctors table...');

    // Check table schema
    console.log('\n📋 DOCTORS TABLE COLUMNS:');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'doctors' })
      .select('*');

    if (columnsError) {
      console.log('Could not get column info via RPC, trying direct query...');
    }

    // Get actual data
    console.log('\n👨‍⚕️ DOCTORS TABLE DATA:');
    const { data: doctors, error: doctorsError } = await supabase
      .from('doctors')
      .select('*')
      .limit(5);

    if (doctorsError) {
      console.error('❌ Error fetching doctors:', doctorsError.message);
      return;
    }

    console.log(`Found ${doctors?.length || 0} doctors:`);
    if (doctors && doctors.length > 0) {
      doctors.forEach((doctor, index) => {
        console.log(`\nDoctor ${index + 1}:`);
        console.log(`  ID: ${doctor.id}`);
        console.log(`  User ID: ${doctor.user_id || 'null'}`);
        console.log(`  Clerk User ID: ${doctor.clerk_user_id || 'null'}`);
        console.log(`  Name: ${doctor.name || 'null'}`);
        console.log(`  Email: ${doctor.email || 'null'}`);
      });
    } else {
      console.log('⚠️  No doctors found in the table!');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkDoctorsTable();
