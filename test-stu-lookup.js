import { createClient } from '@supabase/supabase-js';

const client = createClient('https://mduyidzhoyrqbtpettar.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kdXlpZHpob3lycWJ0cGV0dGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NTI0MzIsImV4cCI6MjA5MTQyODQzMn0.Ia9wQxqqOEJBmpUeTSFFKFwSI1jXjj8QPcJIe28fbCA');

async function testLookup() {
  console.log('Testing student lookup by code...\n');
  
  const { data, error } = await client
    .from('students')
    .select('*')
    .eq('student_id', 'STU001');
    
  if (error) {
    console.log('❌ Error:', error.message);
  } else {
    console.log('✅ Found:', data.length, 'student(s)');
    data.forEach(s => {
      console.log(`  - ${s.student_id}: ${s.name} (${s.level})`);
    });
  }
}

testLookup().catch(console.error);
