import { useState, useEffect } from 'react';
import { Lock, Unlock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { sessionService, type SessionLock } from '../../features/sessions/sessionService';
import { ATTENDANCE_LEVELS } from '../../app/pages/volunteer/attendance/config';
import { useAuth } from '../../features/auth/AuthProvider';

export function QuickSessionBlocker() {
  const { session: userSession } = useAuth();
  const [locks, setLocks] = useState<SessionLock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Get all today's sessions across both levels
  const allSessions = ATTENDANCE_LEVELS.flatMap((level) =>
    level.days.flatMap((day) =>
      day.sessions.map((session) => ({
        level: level.id,
        day: day.id,
        session: session.name,
        time: session.time,
      }))
    )
  );

  useEffect(() => {
    const loadLocks = async () => {
      setIsLoading(true);
      try {
        const data = await sessionService.listSessionLocks();
        const todayLocks = data.filter((lock) => lock.date === today);
        setLocks(todayLocks);
      } catch (err) {
        console.error('Failed to load locks:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLocks();
    const unsub = sessionService.subscribe(() => loadLocks());
    return () => unsub?.();
  }, [today]);

  const handleCloseSession = async (levelId: string, dayId: string, sessionName: string) => {
    if (!userSession) return;

    setIsClosing(true);
    try {
      await sessionService.closeSession(
        today,
        sessionName,
        levelId,
        userSession.displayName,
        'Admin quick block'
      );
      toast.success(`✓ Blocked ${sessionName} for ${levelId}`);
    } catch (err) {
      toast.error('Failed to block session');
      console.error(err);
    } finally {
      setIsClosing(false);
    }
  };

  const handleOpenSession = async (lockId: number, sessionName: string) => {
    setIsClosing(true);
    try {
      await sessionService.openSession(lockId);
      toast.success(`✓ Opened ${sessionName}`);
    } catch (err) {
      toast.error('Failed to open session');
      console.error(err);
    } finally {
      setIsClosing(false);
    }
  };

  const getSessionStatus = (levelId: string, sessionName: string) => {
    return locks.find((lock) => lock.level === levelId && lock.session === sessionName);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Lock className="w-5 h-5 text-red-600" />
          Today's Sessions
        </h3>
        <span className="text-xs font-semibold text-slate-500">{today}</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
        </div>
      ) : allSessions.length === 0 ? (
        <p className="text-sm text-slate-600 text-center py-4">No sessions scheduled today</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {allSessions.map((item, idx) => {
            const lock = getSessionStatus(item.level, item.session);
            const isBlocked = !!lock;

            return (
              <div
                key={`${item.level}-${item.day}-${item.session}-${idx}`}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isBlocked
                    ? 'border-red-200 bg-red-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600 uppercase">{item.level}</span>
                    <span className="text-xs font-semibold text-slate-500">{item.day}</span>
                    {isBlocked && (
                      <Lock className="w-3 h-3 text-red-600" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-900 truncate">{item.session}</p>
                  <p className="text-xs text-slate-600">{item.time}</p>
                </div>

                <button
                  onClick={() => {
                    if (isBlocked && lock) {
                      handleOpenSession(lock.id, item.session);
                    } else {
                      handleCloseSession(item.level, item.day, item.session);
                    }
                  }}
                  disabled={isClosing}
                  className={`ml-3 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 ${
                    isBlocked
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  } ${isClosing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {isBlocked ? (
                    <>
                      <Unlock className="w-3 h-3" />
                      Unblock
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" />
                      Block
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
        <p className="text-xs text-blue-800">
          💡 <strong>Block:</strong> Prevent volunteers from checking in. <strong>Open:</strong> Resume check-ins.
        </p>
      </div>
    </div>
  );
}
