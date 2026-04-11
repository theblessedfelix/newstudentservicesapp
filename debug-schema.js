import { createClient } from '@supabase/supabase-js';

const client = createClient('https://mduyidzhoyrqbtpettar.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kdXlpZHpob3lycWJ0cGV0dGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NTI0MzIsImV4cCI6MjA5MTQyODQzMn0.Ia9wQxqqOEJBmpUeTSFFKFwSI1jXjj8QPcJIe28fbCA');

async function debug() {
  console.log('Attempting to read from students table...');
  const { data, error } = await client.from('students').select('*').limit(1);
  
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Success! Data:', data);
    console.log('Columns:', Object.keys(data && data[0] ? data[0] : {}));
  }
}

debug().catch(console.error);
