import type { AttendanceLevelId } from '../../app/pages/volunteer/attendanceConfig';

export interface AttendanceRecordLike {
  studentId: string;
  date: string;
  session: string;
  status: 'present' | 'absent';
  volunteer: string;
  volunteerId: string;
}

export interface StudentSummary {
  studentId: string;
  name: string;
  level: 'Level 1' | 'Level 2';
  totalSessions: number;
  presentSessions: number;
  absentSessions: number;
  attendance: number;
  lastSession: string;
}

export interface VolunteerSummary {
  volunteerId: string;
  name: string;
  totalSessions: number;
  totalStudentsManaged: number;
  firstSession: string;
  lastSession: string;
}

function parseDateOrZero(value: string): number {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function buildStudentSummaries(
  attendanceRecords: AttendanceRecordLike[],
  studentDirectory: Record<string, { name: string; level: AttendanceLevelId }>,
  knownStudentIdsByLevel: Record<AttendanceLevelId, string[]>,
): StudentSummary[] {
  const knownIds = Array.from(new Set([...knownStudentIdsByLevel['Level 1'], ...knownStudentIdsByLevel['Level 2']]));

  return knownIds
    .map((studentId) => {
      const records = attendanceRecords.filter((record) => record.studentId === studentId);
      const presentSessions = records.filter((record) => record.status === 'present').length;
      const totalSessions = records.length;
      const absentSessions = Math.max(totalSessions - presentSessions, 0);
      const attendance = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0;

      const latest = records.reduce<string>((latestDate, record) => {
        if (!latestDate) {
          return record.date;
        }

        return parseDateOrZero(record.date) > parseDateOrZero(latestDate) ? record.date : latestDate;
      }, '');

      const info = studentDirectory[studentId];
      const level = info?.level ?? (knownStudentIdsByLevel['Level 2'].includes(studentId) ? 'Level 2' : 'Level 1');

      return {
        studentId,
        name: info?.name ?? `Student ${studentId}`,
        level,
        totalSessions,
        presentSessions,
        absentSessions,
        attendance,
        lastSession: latest || 'N/A',
      } satisfies StudentSummary;
    })
    .sort((a, b) => a.studentId.localeCompare(b.studentId, undefined, { numeric: true, sensitivity: 'base' }));
}

export function buildVolunteerSummaries(
  attendanceRecords: AttendanceRecordLike[],
): VolunteerSummary[] {
  const byVolunteer = attendanceRecords.reduce<Record<string, AttendanceRecordLike[]>>((acc, record) => {
    if (!acc[record.volunteerId]) {
      acc[record.volunteerId] = [];
    }
    acc[record.volunteerId].push(record);
    return acc;
  }, {});

  return Object.entries(byVolunteer)
    .map(([volunteerId, records]) => {
      const sessionKeys = new Set(records.map((record) => `${record.date}__${record.session}`));
      const students = new Set(records.map((record) => record.studentId));
      const sortedDates = records
        .map((record) => record.date)
        .sort((a, b) => parseDateOrZero(a) - parseDateOrZero(b));

      return {
        volunteerId,
        name: records[0]?.volunteer || 'Volunteer',
        totalSessions: sessionKeys.size,
        totalStudentsManaged: students.size,
        firstSession: sortedDates[0] || 'N/A',
        lastSession: sortedDates[sortedDates.length - 1] || 'N/A',
      } satisfies VolunteerSummary;
    })
    .sort((a, b) => b.totalSessions - a.totalSessions);
}
