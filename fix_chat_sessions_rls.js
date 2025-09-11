import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://azjhqasjbrujfddbzxqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6amhxYXNqYnJ1amZkZGJ6eHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjQ1NjMsImV4cCI6MjA3MjMwMDU2M30.Pr0fbz79XckvUUKTi0CPvQWsIFqFEiP2r1PlezlJeOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixChatSessionsRLS() {
  try {
    console.log('🔧 Fixing RLS policies for chat_sessions and messages tables...');

    // Read the SQL file
    const sqlContent = fs.readFileSync('fix_chat_sessions_rls.sql', 'utf8');

    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📄 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`\n⚡ Executing statement ${i + 1}/${statements.length}...`);
        console.log(statement.substring(0, 80) + (statement.length > 80 ? '...' : ''));

        try {
          // Try to execute as a simple query first
          if (statement.includes('SELECT')) {
            const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
            if (error) {
              console.log('RPC failed, trying direct query...');
              // For SELECT statements, we can try direct execution
              const result = await supabase.from('_temp').select('*').limit(1);
              console.log('Direct query result:', result);
            } else {
              console.log('✅ Query executed successfully');
              if (data && data.length > 0) {
                console.log('Result:', JSON.stringify(data, null, 2));
              }
            }
          } else {
            // For DDL statements, we need to use the Supabase dashboard
            console.log('⚠️  DDL statement detected - this needs to be run in Supabase dashboard:');
            console.log(statement);
          }
        } catch (err) {
          console.log('⚠️  Statement execution failed (expected for DDL):', err.message);
        }
      }
    }

    console.log('\n🎉 RLS fix script completed!');
    console.log('📋 Note: DDL statements need to be run manually in Supabase dashboard');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

fixChatSessionsRLS();
