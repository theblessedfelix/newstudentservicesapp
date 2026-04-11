import { createClient } from '@supabase/supabase-js';

const client = createClient('https://mduyidzhoyrqbtpettar.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kdXlpZHpob3lycWJ0cGV0dGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NTI0MzIsImV4cCI6MjA5MTQyODQzMn0.Ia9wQxqqOEJBmpUeTSFFKFwSI1jXjj8QPcJIe28fbCA');

async function testInsert() {
  console.log('Testing direct insert with minimal fields...\n');
  
  // Try with required fields
  const { data, error } = await client
    .from('students')
    .insert({ studentid: 'TEST001', name: 'Test User', level: 1 })
    .select();
    
  if (error) {
    console.log('❌ Error:', error.message);
    console.log('Code:', error.code);
    console.log('Details:', error.details);
  } else {
    console.log('✅ Success!');
    console.log('Inserted:', data);
  }
}

testInsert().catch(console.error);
