import * as persistence from '../../utils/persistence';
import { supabase } from '../shared/backend';
import { publishRealtimeEvent, subscribeToRealtimeTopic } from '../shared/realtime';

export type StudentRecord = {
  id: number;
  studentId: string;
  name: string;
  email: string;
  campus: 'Lagos Island' | 'Lagos Mainland';
  level: 'Level 1' | 'Level 2';
  enrollmentDate: string;
};

function normalizeStudent(row: Record<string, unknown>): StudentRecord {
  return {
    id: Number(row.id),
    studentId: String(row.student_id ?? row.studentId ?? ''),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    campus: (row.campus as StudentRecord['campus']) ?? 'Lagos Island',
    level: (row.level as StudentRecord['level']) ?? 'Level 1',
    enrollmentDate: String(row.enrollment_date ?? row.enrollmentDate ?? ''),
  };
}

export const studentService = {
  async listStudents(): Promise<StudentRecord[]> {
    if (!supabase) {
      return persistence.getAllStudents();
    }

    const { data, error } = await supabase.from('students').select('*').order('name');
    if (error || !data) {
      return persistence.getAllStudents();
    }

    const normalized = data.map((row) => normalizeStudent(row));
    await Promise.all(normalized.map((student) => persistence.saveStudent(student)));
    return normalized;
  },

  async listStudentsByLevel(level: StudentRecord['level']) {
    const students = await this.listStudents();
    return students.filter((student) => student.level === level);
  },

  async saveStudent(student: StudentRecord) {
    if (supabase) {
      const { error } = await supabase.from('students').upsert({
        id: student.id,
        student_id: student.studentId,
        name: student.name,
        email: student.email,
        campus: student.campus,
        level: student.level,
        enrollment_date: student.enrollmentDate,
      });

      if (!error) {
        await persistence.saveStudent(student);
        publishRealtimeEvent('students.changed');
        return;
      }
    }

    await persistence.saveStudent(student);
    publishRealtimeEvent('students.changed');
  },

  async deleteStudent(studentId: number) {
    if (supabase) {
      const { error } = await supabase.from('students').delete().eq('id', studentId);

      if (!error) {
        await persistence.deleteStudent(studentId);
        publishRealtimeEvent('students.changed');
        return;
      }
    }

    await persistence.deleteStudent(studentId);
    publishRealtimeEvent('students.changed');
  },

  subscribe(callback: () => void) {
    if (!supabase) {
      return subscribeToRealtimeTopic('students.changed', callback);
    }

    const channel = supabase
      .channel('students-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, callback)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  },
};