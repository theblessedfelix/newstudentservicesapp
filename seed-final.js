import { createClient } from '@supabase/supabase-js';

const client = createClient('https://mduyidzhoyrqbtpettar.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kdXlpZHpob3lycWJ0cGV0dGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NTI0MzIsImV4cCI6MjA5MTQyODQzMn0.Ia9wQxqqOEJBmpUeTSFFKFwSI1jXjj8QPcJIe28fbCA');

async function seed() {
  console.log('Seeding students with correct schema...\n');
  
  const students = [
    { student_id: 'STU001', name: 'Alice Johnson', email: 'alice@rhema.org', campus: 'Lagos Island', level: 'Level 1', enrollment_date: '2026-01-15' },
    { student_id: 'STU002', name: 'Bob Smith', email: 'bob@rhema.org', campus: 'Lagos Mainland', level: 'Level 1', enrollment_date: '2026-01-20' },
    { student_id: 'STU003', name: 'Carol Davis', email: 'carol@rhema.org', campus: 'Lagos Island', level: 'Level 2', enrollment_date: '2025-06-10' },
    { student_id: 'STU004', name: 'David Wilson', email: 'david@rhema.org', campus: 'Lagos Mainland', level: 'Level 2', enrollment_date: '2025-05-05' },
  ];

  for (const student of students) {
    const { error } = await client.from('students').insert(student);
    if (error) {
      console.log(`✗ Failed to insert ${student.student_id}: ${error.message}`);
    } else {
      console.log(`✓ Inserted ${student.student_id} - ${student.name}`);
    }
  }
  
  console.log('\nVerifying inserted data...');
  const { data: allStudents, error: selectError } = await client.from('students').select('*');
  if (selectError) {
    console.log(`✗ Error reading students: ${selectError.message}`);
  } else {
    console.log(`✓ Total students in database: ${allStudents.length}`);
    allStudents.forEach(s => console.log(`  - ${s.student_id}: ${s.name}`));
  }
  
  console.log('\nDone!');
}

seed().catch(console.error);
