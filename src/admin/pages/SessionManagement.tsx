import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock, Unlock, Plus, X, Check, AlertCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import AppNavbar from '../../components/AppNavbar';
import PageBackButton from '../../components/PageBackButton';
import { sessionService, type SessionLock } from '../../features/sessions/sessionService';
import { attendanceService } from '../../features/attendance/attendanceService';
import { useAuth } from '../../features/auth/AuthProvider';
import { ATTENDANCE_LEVELS } from '../../app/pages/volunteer/attendance/config';

export default function SessionManagement() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [sessionLocks, setSessionLocks] = useState<SessionLock[]>([]);
  const [selectedLock, setSelectedLock] = useState<SessionLock | null>(null);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const [newExceptionStudentId, setNewExceptionStudentId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<'all' | 'Level 1' | 'Level 2'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createLockData, setCreateLockData] = useState({
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    session: '',
    level: 'Level 1' as 'Level 1' | 'Level 2',
    reason: '',
  });

  useEffect(() => {
    if (!session || session.role !== 'admin') {
      navigate('/');
    }
  }, [navigate, session]);

  useEffect(() => {
    const loadLocks = async () => {
      try {
        const locks = await sessionService.listSessionLocks();
        setSessionLocks(locks);
      } catch (error) {
        console.error('Error loading session locks:', error);
      }
    };

    void loadLocks();
    const unsubscribe = sessionService.subscribe(() => {
      void loadLocks();
    });

    return unsubscribe;
  }, []);

  const filteredLocks = useMemo(() => {
    return sessionLocks.filter((lock) => {
      const matchesSearch =
        lock.date.includes(searchQuery) ||
        lock.session.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lock.closedBy && lock.closedBy.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesLevel = filterLevel === 'all' || lock.level === filterLevel;
      const matchesStatus = filterStatus === 'all' || lock.status === filterStatus;
      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [sessionLocks, searchQuery, filterLevel, filterStatus]);

  const handleCloseSession = async (date: string, sessionName: string, level: SessionLock['level']) => {
    if (!session) return;

    try {
      await sessionService.closeSession(date, sessionName, level, session.displayName, closeReason);
      setShowCloseDialog(false);
      setCloseReason('');
      setSelectedLock(null);
      toast.success(`✓ Session closed: ${date} • ${sessionName}`);
    } catch (error) {
      toast.error('Failed to close session');
    }
  };

  const handleOpenSession = async (lockId: number) => {
    try {
      await sessionService.openSession(lockId);
      toast.success('✓ Session reopened');
    } catch (error) {
      toast.error('Failed to reopen session');
    }
  };

  const handleAddException = async (lockId: number) => {
    if (!newExceptionStudentId.trim()) {
      toast.error('Enter a student ID');
      return;
    }

    try {
      await sessionService.addException(lockId, newExceptionStudentId.trim().toUpperCase());
      setNewExceptionStudentId('');
      toast.success(`✓ Exception added for ${newExceptionStudentId}`);
    } catch (error) {
      toast.error('Failed to add exception');
    }
  };

  const handleRemoveException = async (lockId: number, studentId: string) => {
    try {
      await sessionService.removeException(lockId, studentId);
      toast.success(`✓ Exception removed for ${studentId}`);
    } catch (error) {
      toast.error('Failed to remove exception');
    }
  };

  const handleCreateLock = async () => {
    if (!createLockData.session || !session) {
      toast.error('Please select a session');
      return;
    }

    try {
      await sessionService.closeSession(
        createLockData.date,
        createLockData.session,
        createLockData.level,
        session.displayName,
        createLockData.reason || 'Created from Session Management'
      );
      toast.success(`✓ Session locked: ${createLockData.session}`);
      setShowCreateDialog(false);
      setCreateLockData({
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        session: '',
        level: 'Level 1',
        reason: '',
      });
    } catch (error) {
      toast.error('Failed to create session lock');
      console.error(error);
    }
  };

  const closedCount = sessionLocks.filter((l) => l.status === 'closed').length;
  const openCount = sessionLocks.filter((l) => l.status === 'open').length;

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <Toaster position="top-right" richColors />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-16">
          <AppNavbar ctaHref="/admin#/dashboard" />
        </div>

        <div className="mb-8">
          <PageBackButton onClick={() => navigate('/dashboard')} label="Back to Dashboard" />
        </div>

        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black mb-4">
            Session Management
          </h1>
          <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
            Close attendance sessions to prevent further check-ins, or add exceptions for specific students.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <div className="rounded-2xl border border-slate-200 bg-blue-50 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Open Sessions</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{openCount}</p>
              </div>
              <Unlock className="w-8 h-8 text-blue-600 opacity-60" />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-red-50 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Closed Sessions</p>
                <p className="text-3xl font-bold text-red-900 mt-1">{closedCount}</p>
              </div>
              <Lock className="w-8 h-8 text-red-600 opacity-60" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search by date, session, or admin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
            />
            <div className="flex flex-wrap gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterLevel('all')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filterLevel === 'all'
                      ? 'bg-black text-white'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  All Levels
                </button>
                <button
                  onClick={() => setFilterLevel('Level 1')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filterLevel === 'Level 1'
                      ? 'bg-black text-white'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Level 1
                </button>
                <button
                  onClick={() => setFilterLevel('Level 2')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filterLevel === 'Level 2'
                      ? 'bg-black text-white'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Level 2
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-black text-white'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  All Status
                </button>
                <button
                  onClick={() => setFilterStatus('open')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filterStatus === 'open'
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Open
                </button>
                <button
                  onClick={() => setFilterStatus('closed')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filterStatus === 'closed'
                      ? 'bg-red-600 text-white'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Closed
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Session Locks List */}
        <div className="space-y-4 mb-12">
          {filteredLocks.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-slate-300 bg-slate-50">
              <p className="text-slate-600 font-medium">No sessions found matching your criteria</p>
            </div>
          ) : (
            filteredLocks.map((lock) => (
              <div
                key={lock.id}
                onClick={() => setSelectedLock(lock)}
                className={`rounded-2xl border p-6 cursor-pointer transition-all ${
                  lock.status === 'closed'
                    ? 'border-red-200 bg-red-50 hover:border-red-300'
                    : 'border-blue-200 bg-blue-50 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{lock.date}</h3>
                      <span className="text-sm font-semibold text-slate-700">{lock.session}</span>
                      <span className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded bg-slate-200 text-slate-700">
                        {lock.level}
                      </span>
                    </div>
                    {lock.status === 'closed' && (
                      <div className="text-sm text-slate-700 mt-2">
                        <p className="font-medium">
                          Closed by {lock.closedBy} at {lock.closedAt ? new Date(lock.closedAt).toLocaleString() : 'N/A'}
                        </p>
                        {lock.reason && <p className="text-slate-600">Reason: {lock.reason}</p>}
                        {lock.allowedExceptions.length > 0 && (
                          <p className="text-slate-600">
                            {lock.allowedExceptions.length} exception(s) allowed
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        lock.status === 'closed'
                          ? 'bg-red-200 text-red-700'
                          : 'bg-blue-200 text-blue-700'
                      }`}
                    >
                      {lock.status === 'closed' ? (
                        <Lock className="w-6 h-6" />
                      ) : (
                        <Unlock className="w-6 h-6" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLock && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedLock(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-black p-6 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-white text-2xl font-bold">
                {selectedLock.date} • {selectedLock.session}
              </h2>
              <button onClick={() => setSelectedLock(null)} className="text-white hover:bg-slate-800 rounded p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Session Info */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Session Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs font-semibold text-slate-600 uppercase">Level</p>
                      <p className="text-slate-900 font-semibold mt-1">{selectedLock.level}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs font-semibold text-slate-600 uppercase">Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        {selectedLock.status === 'closed' ? (
                          <>
                            <Lock className="w-4 h-4 text-red-600" />
                            <span className="text-red-600 font-semibold">Closed</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-600 font-semibold">Open</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-200" />

                {/* Closed Details */}
                {selectedLock.status === 'closed' && (
                  <>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-3">Closure Details</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-600 uppercase">Closed By</p>
                          <p className="text-slate-900 mt-1">{selectedLock.closedBy}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-600 uppercase">Closed At</p>
                          <p className="text-slate-900 mt-1">
                            {selectedLock.closedAt ? new Date(selectedLock.closedAt).toLocaleString() : 'N/A'}
                          </p>
                        </div>
                        {selectedLock.reason && (
                          <div>
                            <p className="text-xs font-semibold text-slate-600 uppercase">Reason</p>
                            <p className="text-slate-900 mt-1 bg-slate-50 rounded p-3">{selectedLock.reason}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <hr className="border-slate-200" />

                    {/* Exceptions */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-3">Allowed Exceptions</h3>
                      <div className="space-y-2 mb-4">
                        {selectedLock.allowedExceptions.length === 0 ? (
                          <p className="text-slate-600 text-sm">No exceptions allowed</p>
                        ) : (
                          selectedLock.allowedExceptions.map((studentId) => (
                            <div
                              key={studentId}
                              className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3"
                            >
                              <span className="font-medium text-green-900">{studentId}</span>
                              <button
                                onClick={() => handleRemoveException(selectedLock.id, studentId)}
                                className="p-1 hover:bg-red-100 rounded transition-colors"
                              >
                                <X className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Student ID to add exception"
                          value={newExceptionStudentId}
                          onChange={(e) => setNewExceptionStudentId(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddException(selectedLock.id);
                            }
                          }}
                          className="flex-1 h-10 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-slate-400"
                        />
                        <button
                          onClick={() => handleAddException(selectedLock.id)}
                          className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                    </div>

                    <hr className="border-slate-200" />

                    {/* Reopen Button */}
                    <button
                      onClick={() => handleOpenSession(selectedLock.id)}
                      className="w-full px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Unlock className="w-5 h-5" />
                      Reopen Session
                    </button>
                  </>
                )}

                {/* Close Button for Open Sessions */}
                {selectedLock.status === 'open' && (
                  <button
                    onClick={() => setShowCloseDialog(true)}
                    className="w-full px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Lock className="w-5 h-5" />
                    Close Session
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close Dialog */}
      {showCloseDialog && selectedLock && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowCloseDialog(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-black p-6 rounded-t-2xl">
              <h2 className="text-white text-xl font-bold">Close Session?</h2>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-slate-700">
                Close <strong>{selectedLock.date} • {selectedLock.session}</strong>? No more check-ins will be allowed unless you add
                specific exceptions.
              </p>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase">Reason (optional)</label>
                <textarea
                  value={closeReason}
                  onChange={(e) => setCloseReason(e.target.value)}
                  placeholder="Why is this session being closed?"
                  className="w-full mt-2 h-24 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-slate-400 text-sm"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCloseDialog(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleCloseSession(
                      selectedLock.date,
                      selectedLock.session,
                      selectedLock.level
                    )
                  }
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
