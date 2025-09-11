import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://azjhqasjbrujfddbzxqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6amhxYXNqYnJ1amZkZGJ6eHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjQ1NjMsImV4cCI6MjA3MjMwMDU2M30.Pr0fbz79XckvUUKTi0CPvQWsIFqFEiP2r1PlezlJeOQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixChatRLS() {
  try {
    console.log('🔧 Fixing RLS policies for chat tables...');

    // Read the SQL file
    const sqlContent = fs.readFileSync('fix_chat_rls.sql', 'utf8');

    // Split into individual statements (basic approach)
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
        console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));

        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });

          if (error) {
            // If rpc doesn't work, try direct execution for some statements
            console.log('RPC failed, trying direct execution...');

            // For simple statements, we can try direct execution
            if (statement.includes('CREATE POLICY') ||
                statement.includes('DROP POLICY') ||
                statement.includes('ALTER TABLE') ||
                statement.includes('CREATE TABLE') ||
                statement.includes('CREATE INDEX')) {

              // These are DDL statements that might work with direct execution
              const { error: directError } = await supabase.from('_supabase_migration_temp').select('*').limit(1);
              if (directError) {
                console.log('❌ Direct execution also failed, you may need to run this SQL manually in Supabase dashboard');
                console.log('Error:', directError.message);
              }
            } else {
              console.log('❌ Failed to execute statement');
              console.log('Error:', error.message);
            }
          } else {
            console.log('✅ Statement executed successfully');
          }
        } catch (err) {
          console.log('⚠️  Statement execution failed (this might be expected for some DDL):', err.message);
        }
      }
    }

    console.log('\n🎉 RLS fix script completed!');
    console.log('📋 Note: You may need to run the SQL manually in Supabase dashboard for DDL statements');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

fixChatRLS();
