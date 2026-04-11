import * as persistence from '../../utils/persistence';
import { enqueueOfflineMutation } from '../shared/offlineQueue';
import { supabase } from '../shared/backend';
import { publishRealtimeEvent } from '../shared/realtime';

export type ExceptionReason = 
  | 'sick'
  | 'traffic'
  | 'family_emergency'
  | 'vehicle_issue'
  | 'other';

export type AttendanceException = {
  id: number;
  studentId: string;
  date: string;
  session: string;
  level: 'Level 1' | 'Level 2';
  reason: ExceptionReason;
  details: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
};

export const EXCEPTION_REASONS: Record<ExceptionReason, string> = {
  sick: '🤒 Sick/Health Issue',
  traffic: '🚗 Traffic Delay',
  family_emergency: '👨‍👩‍👧 Family Emergency',
  vehicle_issue: '🔧 Vehicle Problem',
  other: '📝 Other Reason',
};

function normalizeException(row: Record<string, unknown>): AttendanceException {
  return {
    id: Number(row.id),
    studentId: String(row.student_id ?? row.studentId ?? ''),
    date: String(row.date ?? ''),
    session: String(row.session ?? ''),
    level: (row.level as AttendanceException['level']) ?? 'Level 1',
    reason: (row.reason as ExceptionReason) ?? 'other',
    details: String(row.details ?? ''),
    requestedBy: String(row.requested_by ?? row.requestedBy ?? ''),
    requestedAt: String(row.requested_at ?? row.requestedAt ?? ''),
    status: (row.status as AttendanceException['status']) ?? 'pending',
    reviewedBy: row.reviewed_by ? String(row.reviewed_by) : undefined,
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : undefined,
    reviewNotes: row.review_notes ? String(row.review_notes) : undefined,
  };
}

function cacheExceptions(items: AttendanceException[]) {
  items.forEach((exception) => persistence.saveAppSetting(`exception-${exception.id}`, exception));
}

function getLocalExceptions(): AttendanceException[] {
  const allSettings = localStorage.getItem('app-settings');
  if (!allSettings) return [];
  const settings = JSON.parse(allSettings);
  const exceptions: AttendanceException[] = [];
  Object.keys(settings).forEach((key) => {
    if (key.startsWith('exception-')) {
      exceptions.push(settings[key]);
    }
  });
  return exceptions;
}

export const exceptionService = {
  async listExceptions(): Promise<AttendanceException[]> {
    if (!supabase) {
      return getLocalExceptions();
    }

    const { data, error } = await supabase
      .from('attendance_exceptions')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error || !data) {
      return getLocalExceptions();
    }

    const normalized = data.map((row) => normalizeException(row));
    cacheExceptions(normalized);
    return normalized;
  },

  async listExceptionsForStudent(studentId: string): Promise<AttendanceException[]> {
    const allExceptions = await this.listExceptions();
    return allExceptions.filter((e) => e.studentId === studentId);
  },

  async listPendingExceptions(): Promise<AttendanceException[]> {
    const allExceptions = await this.listExceptions();
    return allExceptions.filter((e) => e.status === 'pending');
  },

  async createException(exception: AttendanceException) {
    if (supabase && navigator.onLine) {
      const { error } = await supabase.from('attendance_exceptions').insert({
        id: exception.id,
        student_id: exception.studentId,
        date: exception.date,
        session: exception.session,
        level: exception.level,
        reason: exception.reason,
        details: exception.details,
        requested_by: exception.requestedBy,
        requested_at: exception.requestedAt,
        status: exception.status,
        reviewed_by: exception.reviewedBy,
        reviewed_at: exception.reviewedAt,
        review_notes: exception.reviewNotes,
      });

      if (!error) {
        persistence.saveAppSetting(`exception-${exception.id}`, exception);
        publishRealtimeEvent('exceptions.changed');
        return { synced: true };
      }
    }

    persistence.saveAppSetting(`exception-${exception.id}`, exception);
    enqueueOfflineMutation({
      entity: 'exceptions',
      operation: 'create',
      payload: exception as unknown as Record<string, unknown>,
    });

    return { synced: false };
  },

  async approveException(exceptionId: number, reviewedBy: string, notes?: string) {
    const exceptions = await this.listExceptions();
    const exception = exceptions.find((e) => e.id === exceptionId);

    if (!exception) {
      throw new Error('Exception not found');
    }

    const updated: AttendanceException = {
      ...exception,
      status: 'approved',
      reviewedBy,
      reviewedAt: new Date().toLocaleString('en-US'),
      reviewNotes: notes,
    };

    if (supabase && navigator.onLine) {
      const { error } = await supabase
        .from('attendance_exceptions')
        .update({
          status: 'approved',
          reviewed_by: reviewedBy,
          reviewed_at: updated.reviewedAt,
          review_notes: notes,
        })
        .eq('id', exceptionId);

      if (!error) {
        persistence.saveAppSetting(`exception-${exceptionId}`, updated);
        publishRealtimeEvent('exceptions.changed');
        return { synced: true };
      }
    }

    persistence.saveAppSetting(`exception-${exceptionId}`, updated);
    enqueueOfflineMutation({
      entity: 'exceptions',
      operation: 'update',
      payload: { id: exceptionId, ...updated } as unknown as Record<string, unknown>,
    });

    return { synced: false };
  },

  async rejectException(exceptionId: number, reviewedBy: string, notes?: string) {
    const exceptions = await this.listExceptions();
    const exception = exceptions.find((e) => e.id === exceptionId);

    if (!exception) {
      throw new Error('Exception not found');
    }

    const updated: AttendanceException = {
      ...exception,
      status: 'rejected',
      reviewedBy,
      reviewedAt: new Date().toLocaleString('en-US'),
      reviewNotes: notes,
    };

    if (supabase && navigator.onLine) {
      const { error } = await supabase
        .from('attendance_exceptions')
        .update({
          status: 'rejected',
          reviewed_by: reviewedBy,
          reviewed_at: updated.reviewedAt,
          review_notes: notes,
        })
        .eq('id', exceptionId);

      if (!error) {
        persistence.saveAppSetting(`exception-${exceptionId}`, updated);
        publishRealtimeEvent('exceptions.changed');
        return { synced: true };
      }
    }

    persistence.saveAppSetting(`exception-${exceptionId}`, updated);
    enqueueOfflineMutation({
      entity: 'exceptions',
      operation: 'update',
      payload: { id: exceptionId, ...updated } as unknown as Record<string, unknown>,
    });

    return { synced: false };
  },

  subscribe(callback: () => void) {
    const unsubscribe = supabase?.realtime.on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_exceptions' }, () => callback()).subscribe();
    
    if (!unsubscribe) {
      const listener = () => callback();
      window.addEventListener('offline-mutation-synced', listener);
      return () => window.removeEventListener('offline-mutation-synced', listener);
    }

    return () => unsubscribe?.unsubscribe?.();
  },
};
