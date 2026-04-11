import * as persistence from '../../utils/persistence';
import { supabase } from '../shared/backend';
import { publishRealtimeEvent, subscribeToRealtimeTopic } from '../shared/realtime';

export type SessionLock = {
  id: number;
  date: string;
  session: string;
  level: 'Level 1' | 'Level 2';
  status: 'open' | 'closed';
  closedBy?: string;
  closedAt?: string;
  reason?: string;
  allowedExceptions: string[]; // student IDs allowed even when closed
};

function normalizeSessionLock(row: Record<string, unknown>): SessionLock {
  return {
    id: Number(row.id),
    date: String(row.date ?? ''),
    session: String(row.session ?? ''),
    level: (row.level as SessionLock['level']) ?? 'Level 1',
    status: (row.status as SessionLock['status']) ?? 'open',
    closedBy: row.closed_by ? String(row.closed_by) : undefined,
    closedAt: row.closed_at ? String(row.closed_at) : undefined,
    reason: row.reason ? String(row.reason) : undefined,
    allowedExceptions: Array.isArray(row.allowed_exceptions) ? row.allowed_exceptions : [],
  };
}

async function cacheSessionLocks(locks: SessionLock[]) {
  // For now, just store in memory via realtime; full persistence can be added later
  await Promise.all(locks.map((lock) => persistence.saveAppSetting(`session-lock-${lock.id}`, lock)));
}

export const sessionService = {
  async listSessionLocks(): Promise<SessionLock[]> {
    if (!supabase) {
      // Retrieve from localStorage
      const keys = Object.keys(window.localStorage || {}).filter((k) =>
        k.startsWith('app_setting_session-lock-')
      );
      const locks = keys
        .map((key) => {
          const raw = window.localStorage?.getItem(key);
          return raw ? JSON.parse(raw) : null;
        })
        .filter(Boolean);
      return locks as SessionLock[];
    }

    const { data, error } = await supabase.from('session_locks').select('*').order('date', {
      ascending: false,
    });
    if (error || !data) {
      // Fallback to localStorage
      const keys = Object.keys(window.localStorage || {}).filter((k) =>
        k.startsWith('app_setting_session-lock-')
      );
      const locks = keys
        .map((key) => {
          const raw = window.localStorage?.getItem(key);
          return raw ? JSON.parse(raw) : null;
        })
        .filter(Boolean);
      return locks as SessionLock[];
    }

    const normalized = data.map((row) => normalizeSessionLock(row));
    await cacheSessionLocks(normalized);
    return normalized;
  },

  async closeSession(
    date: string,
    session: string,
    level: SessionLock['level'],
    closedBy: string,
    reason?: string
  ): Promise<SessionLock> {
    const lock: SessionLock = {
      id: Date.now(),
      date,
      session,
      level,
      status: 'closed',
      closedBy,
      closedAt: new Date().toISOString(),
      reason,
      allowedExceptions: [],
    };

    if (supabase) {
      await supabase.from('session_locks').insert({
        id: lock.id,
        date,
        session,
        level,
        status: 'closed',
        closed_by: closedBy,
        closed_at: lock.closedAt,
        reason,
        allowed_exceptions: [],
      });
    }

    await persistence.saveAppSetting(`session-lock-${lock.id}`, lock);
    publishRealtimeEvent('sessions.changed');
    return lock;
  },

  async openSession(lockId: number): Promise<void> {
    if (supabase) {
      await supabase.from('session_locks').delete().eq('id', lockId);
    }

    persistence.deleteAppSetting(`session-lock-${lockId}`);
    publishRealtimeEvent('sessions.changed');
  },

  async addException(lockId: number, studentId: string): Promise<SessionLock> {
    const locks = await this.listSessionLocks();
    const target = locks.find((lock) => lock.id === lockId);
    if (!target) {
      throw new Error('Session lock not found');
    }

    const updated = {
      ...target,
      allowedExceptions: Array.from(new Set([...target.allowedExceptions, studentId])),
    };

    if (supabase) {
      await supabase.from('session_locks').update({ allowed_exceptions: updated.allowedExceptions }).eq('id', lockId);
    }

    await persistence.saveAppSetting(`session-lock-${lockId}`, updated);
    publishRealtimeEvent('sessions.changed');
    return updated;
  },

  async removeException(lockId: number, studentId: string): Promise<SessionLock> {
    const locks = await this.listSessionLocks();
    const target = locks.find((lock) => lock.id === lockId);
    if (!target) {
      throw new Error('Session lock not found');
    }

    const updated = {
      ...target,
      allowedExceptions: target.allowedExceptions.filter((id) => id !== studentId),
    };

    if (supabase) {
      await supabase.from('session_locks').update({ allowed_exceptions: updated.allowedExceptions }).eq('id', lockId);
    }

    await persistence.saveAppSetting(`session-lock-${lockId}`, updated);
    publishRealtimeEvent('sessions.changed');
    return updated;
  },

  async isSessionClosed(
    date: string,
    session: string,
    level: SessionLock['level'],
    studentIdForException?: string
  ): Promise<boolean> {
    const locks = await this.listSessionLocks();
    const lock = locks.find((l) => l.date === date && l.session === session && l.level === level);

    if (!lock || lock.status === 'open') {
      return false;
    }

    // Check if student has exception
    if (studentIdForException && lock.allowedExceptions.includes(studentIdForException)) {
      return false;
    }

    return true;
  },

  subscribe(callback: () => void) {
    if (!supabase) {
      return subscribeToRealtimeTopic('sessions.changed', callback);
    }

    const channel = supabase
      .channel('sessions-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_locks' }, callback)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  },
};
