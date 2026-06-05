import { createClient } from '@supabase/supabase-js';

const client = createClient('https://mduyidzhoyrqbtpettar.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kdXlpZHpob3lycWJ0cGV0dGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NTI0MzIsImV4cCI6MjA5MTQyODQzMn0.Ia9wQxqqOEJBmpUeTSFFKFwSI1jXjj8QPcJIe28fbCA');

const studentIds = [
  '20175', '21125', '20364', '21099', '21100',
  '21076', '21127', '21092', '21203', '21128',
  '21107', '21069', '21342', '21103', '21475',
  '21343', '21101', '21079', '21469', '21511',
  '21102', '21126', '21114', '21087', '11507',
  '11508'
];

async function runMigration() {
  console.log(`Starting migration to promote ${studentIds.length} students to Level 2 in Supabase...\n`);

  const { data, error } = await client
    .from('students')
    .update({ level: 'Level 2' })
    .in('student_id', studentIds)
    .select();

  if (error) {
    console.error('❌ Error during update:', error.message);
  } else {
    console.log(`✅ Successfully updated database. Records matched/modified: ${data ? data.length : 0}`);
    if (data && data.length > 0) {
      data.forEach(s => {
        console.log(`  - Promoted: ${s.student_id} - ${s.name} (${s.level})`);
      });
    }
  }
}

runMigration().catch(console.error);
