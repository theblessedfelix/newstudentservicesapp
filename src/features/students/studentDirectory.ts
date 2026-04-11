import { getLevel1ScannerStudents } from '../../app/data/level1StudentRegistry';
import { getLevel2ScannerStudents } from '../../app/data/level2StudentRegistry';
import type { AttendanceLevelId } from '../../app/pages/volunteer/attendanceConfig';

export interface PersistedStudentLike {
  studentId: string;
  name: string;
  level: AttendanceLevelId;
}

export type DirectoryStudent = {
  studentId: string;
  name: string;
  level: AttendanceLevelId;
};

export function getRegistryStudents(): DirectoryStudent[] {
  const level1 = getLevel1ScannerStudents().map((student) => ({
    studentId: student.studentId,
    name: student.name,
    level: 'Level 1' as AttendanceLevelId,
  }));

  const level2 = getLevel2ScannerStudents().map((student) => ({
    studentId: student.studentId,
    name: student.name,
    level: 'Level 2' as AttendanceLevelId,
  }));

  return [...level1, ...level2];
}

export function buildStudentDirectory(
  persistedStudents: PersistedStudentLike[] = [],
): Record<string, DirectoryStudent> {
  const fromRegistry = getRegistryStudents();
  const directory = new Map<string, DirectoryStudent>();

  for (const student of fromRegistry) {
    directory.set(student.studentId, student);
  }

  for (const student of persistedStudents) {
    directory.set(student.studentId, {
      studentId: student.studentId,
      name: student.name,
      level: student.level,
    });
  }

  return Object.fromEntries(directory.entries());
}

export function toInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 3);
}
