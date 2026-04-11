import { createClient } from '@supabase/supabase-js';

const client = createClient('https://mduyidzhoyrqbtpettar.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kdXlpZHpob3lycWJ0cGV0dGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NTI0MzIsImV4cCI6MjA5MTQyODQzMn0.Ia9wQxqqOEJBmpUeTSFFKFwSI1jXjj8QPcJIe28fbCA');

async function seed() {
  console.log('Refreshing schema cache...');
  
  // First, do a simple query to force schema refresh
  await client.from('students').select('*').limit(1);
  
  console.log('Seeding students...');
  
  const students = [
    { studentid: 'STU001', name: 'Alice Johnson', level: 1 },
    { studentid: 'STU002', name: 'Bob Smith', level: 1 },
    { studentid: 'STU003', name: 'Carol Davis', level: 2 },
    { studentid: 'STU004', name: 'David Wilson', level: 2 },
  ];

  for (const student of students) {
    const { data, error } = await client.from('students').insert([student]).select();
    if (error) {
      console.log(`✗ Failed to insert ${student.studentid}: ${error.message}`);
    } else {
      console.log(`✓ Inserted ${student.studentid} - ${student.name}`);
    }
  }
  
  console.log('\nVerifying inserted data...');
  const { data: allStudents, error: selectError } = await client.from('students').select('*');
  if (selectError) {
    console.log(`✗ Error reading students: ${selectError.message}`);
  } else {
    console.log(`✓ Total students in database: ${allStudents.length}`);
    allStudents.forEach(s => console.log(`  - ${s.studentId}: ${s.name}`));
  }
  
  console.log('\nDone!');
}

seed().catch(console.error);
