import * as persistence from '../../utils/persistence';
import { enqueueOfflineMutation } from '../shared/offlineQueue';
import { supabase } from '../shared/backend';
import { publishRealtimeEvent, subscribeToRealtimeTopic } from '../shared/realtime';

export type AttendanceRecord = {
  id: number;
  studentId: string;
  attendanceDate: string;
  sessionNum: number;
  volunteerId: string;
};

function normalizeAttendance(row: Record<string, unknown>): AttendanceRecord {
  return {
    id: Number(row.id),
    studentId: String(row.student_id ?? ''),
    attendanceDate: String(row.attendance_date ?? ''),
    sessionNum: Number(row.session_num ?? 0),
    volunteerId: String(row.volunteer_id ?? ''),
  };
}

async function cacheAttendance(records: AttendanceRecord[]) {
  await Promise.all(records.map((record) => persistence.saveAttendanceRecord(record)));
}

export const attendanceService = {
  async listAttendanceRecords(): Promise<AttendanceRecord[]> {
    if (!supabase) {
      return persistence.getAllAttendanceRecords();
    }

    const { data, error } = await supabase.from('attendance_records').select('*').order('date', { ascending: false });
    if (error || !data) {
      return persistence.getAllAttendanceRecords();
    }

    const normalized = data.map((row) => normalizeAttendance(row));
    await cacheAttendance(normalized);
    return normalized;
  },

  async recordAttendance(record: AttendanceRecord) {
    if (supabase && navigator.onLine) {
      const { error } = await supabase.from('attendance_records').insert({
        student_id: record.studentId,
        attendance_date: record.attendanceDate,
        session_num: record.sessionNum,
        volunteer_id: record.volunteerId,
      });

      if (!error) {
        await persistence.saveAttendanceRecord(record);
        publishRealtimeEvent('attendance.changed');
        return { synced: true };
      }
    }

    await persistence.saveAttendanceRecord(record);
    enqueueOfflineMutation({
      entity: 'attendance',
      operation: 'create',
      payload: record as unknown as Record<string, unknown>,
    });
    publishRealtimeEvent('attendance.changed');
    return { synced: false };
  },

  subscribe(callback: () => void) {
    if (!supabase) {
      return subscribeToRealtimeTopic('attendance.changed', callback);
    }

    const channel = supabase
      .channel('attendance-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_records' }, callback)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  },
};