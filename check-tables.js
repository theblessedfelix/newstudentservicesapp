import { createClient } from '@supabase/supabase-js';
const client = createClient('https://mduyidzhoyrqbtpettar.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kdXlpZHpob3lycWJ0cGV0dGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NTI0MzIsImV4cCI6MjA5MTQyODQzMn0.Ia9wQxqqOEJBmpUeTSFFKFwSI1jXjj8QPcJIe28fbCA');

async function check() {
  const tables = ['students', 'attendance_records', 'approval_requests', 'attendance_exceptions', 'session_locks'];
  
  console.log('\n=== SUPABASE TABLE STATUS ===\n');
  
  for (const table of tables) {
    try {
      const { count } = await client.from(table).select('*', { count: 'exact', head: true });
      const { data } = await client.from(table).select('*').limit(1);
      console.log(`✓ ${table.padEnd(25)} rows: ${count || 0}`);
      if (data && data.length > 0) {
        console.log(`  Sample: ${JSON.stringify(data[0]).substring(0, 100)}`);
      }
    } catch (err) {
      console.log(`✗ ${table.padEnd(25)} ERROR: ${err.message}`);
    }
  }
  
  console.log('\n=== AUTH USERS ===\n');
  try {
    const { data: users, error } = await client.auth.admin.listUsers();
    if (error) throw error;
    console.log(`Total auth users: ${users.users.length}`);
    users.users.forEach(u => console.log(`  - ${u.email} (${u.user_metadata?.display_name || 'N/A'})`));
  } catch (err) {
    console.log(`Failed to list auth users: ${err.message}`);
  }
}

check().catch(console.error);
