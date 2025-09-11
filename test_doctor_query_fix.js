import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://azjhqasjbrujfddbzxqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6amhxYXNqYnJ1amZkZGJ6eHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjQ1NjMsImV4cCI6MjA3MjMwMDU2M30.Pr0fbz79XckvUUKTi0CPvQWsIFqFEiP2r1PlezlJeOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDoctorQueryFix() {
  try {
    console.log('🧪 Testing doctor query fix...');

    // Test the OLD problematic approach (this should fail with 406)
    console.log('\n❌ Testing OLD approach (should fail):');
    try {
      const { data: doctorByUserId, error: userIdError } = await supabase
        .from('doctors')
        .select('user_id')
        .eq('user_id', 'user_32VoA44OaYJxHEZdPKAlY0cYOJu')
        .single();

      if (userIdError) {
        console.log('OLD approach failed as expected:', userIdError.message);
      } else {
        console.log('OLD approach unexpectedly worked:', doctorByUserId);
      }
    } catch (err) {
      console.log('OLD approach failed with error:', err.message);
    }

    // Test the NEW safe approach (this should work)
    console.log('\n✅ Testing NEW approach (should work):');
    try {
      const { data: doctors, error: doctorsError } = await supabase
        .from('doctors')
        .select('*')
        .limit(5);

      if (doctorsError) {
        console.error('NEW approach failed:', doctorsError);
      } else {
        console.log('NEW approach worked! Found', doctors?.length || 0, 'doctors');

        // Find the matching doctor
        const targetUserId = 'user_32VoA44OaYJxHEZdPKAlY0cYOJu';
        const matchingDoctor = doctors?.find(d => d.user_id === targetUserId);

        if (matchingDoctor) {
          console.log('✅ Found matching doctor:', matchingDoctor.name);
        } else {
          console.log('⚠️  No exact match, using fallback doctor:', doctors?.[0]?.name);
        }
      }
    } catch (err) {
      console.error('NEW approach failed with error:', err.message);
    }

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testDoctorQueryFix();
