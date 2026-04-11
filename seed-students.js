import { createClient } from '@supabase/supabase-js';

const client = createClient('https://mduyidzhoyrqbtpettar.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kdXlpZHpob3lycWJ0cGV0dGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NTI0MzIsImV4cCI6MjA5MTQyODQzMn0.Ia9wQxqqOEJBmpUeTSFFKFwSI1jXjj8QPcJIe28fbCA');

async function seed() {
  console.log('Seeding students...');
  
  const students = [
    { studentId: 'STU001', name: 'Alice Johnson', level: 1 },
    { studentId: 'STU002', name: 'Bob Smith', level: 1 },
    { studentId: 'STU003', name: 'Carol Davis', level: 2 },
    { studentId: 'STU004', name: 'David Wilson', level: 2 },
  ];

  for (const student of students) {
    const { error } = await client.from('students').insert(student);
    if (error) {
      console.log(`✗ Failed to insert ${student.studentId}: ${error.message}`);
    } else {
      console.log(`✓ Inserted ${student.studentId} - ${student.name}`);
    }
  }
  
  console.log('\nDone! Check Supabase dashboard to verify.');
}

seed().catch(console.error);
