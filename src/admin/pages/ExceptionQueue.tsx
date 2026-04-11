import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../features/auth/AuthProvider';
import { exceptionService, EXCEPTION_REASONS, type AttendanceException } from '../../features/exceptions/exceptionService';
import AppNavbar from '../../components/AppNavbar';
import PageBackButton from '../../components/PageBackButton';
import { useNavigate } from 'react-router';

export default function ExceptionQueue() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [exceptions, setExceptions] = useState<AttendanceException[]>([]);
  const [filteredExceptions, setFilteredExceptions] = useState<AttendanceException[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedException, setSelectedException] = useState<AttendanceException | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!session || session.role !== 'admin') {
      navigate('/');
      return;
    }

    const loadExceptions = async () => {
      setIsLoading(true);
      try {
        const data = await exceptionService.listExceptions();
        setExceptions(data);
      } catch (err) {
        console.error('Failed to load exceptions:', err);
        toast.error('Failed to load exceptions');
      } finally {
        setIsLoading(false);
      }
    };

    loadExceptions();
    const unsub = exceptionService.subscribe(() => loadExceptions());

    // Polling fallback: refresh every 10s in case Realtime misses an event
    const poll = setInterval(() => void loadExceptions(), 10000);

    return () => {
      unsub?.();
      clearInterval(poll);
    };
  }, [session, navigate]);

  useEffect(() => {
    let filtered = exceptions;
    if (filter !== 'all') {
      filtered = filtered.filter((e) => e.status === filter);
    }
    setFilteredExceptions(filtered.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()));
  }, [exceptions, filter]);

  const handleApprove = async () => {
    if (!selectedException || !session) return;

    setIsSubmitting(true);
    try {
      await exceptionService.approveException(selectedException.id, session.displayName, reviewNotes);
      toast.success('✓ Exception approved');
      setSelectedException(null);
      setReviewNotes('');
    } catch (err) {
      toast.error('Failed to approve exception');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedException || !session) return;

    setIsSubmitting(true);
    try {
      await exceptionService.rejectException(selectedException.id, session.displayName, reviewNotes);
      toast.success('✓ Exception rejected');
      setSelectedException(null);
      setReviewNotes('');
    } catch (err) {
      toast.error('Failed to reject exception');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: AttendanceException['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f5]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <AppNavbar
          ctaHref="/admin#/dashboard"
          items={[
            { label: 'Dashboard', href: '/admin#/dashboard' },
            { label: 'Students', href: '/admin#/students' },
            { label: 'Reports', href: '/admin#/reports' },
          ]}
        />

        <main className="pt-8 pb-10">
          <PageBackButton onClick={() => navigate('/dashboard')} label="Back to Dashboard" />

          <section className="mt-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900">Exception Requests</h1>
                <p className="mt-2 text-slate-600">Review and approve attendance exceptions from volunteers</p>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-slate-300">
                <span className="text-sm font-semibold text-slate-700">{filteredExceptions.length}</span>
                <span className="text-xs text-slate-600">{filter === 'all' ? 'Total' : filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filter === f
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-slate-600">Loading exceptions...</div>
              </div>
            ) : filteredExceptions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">No {filter === 'all' ? '' : filter} exceptions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExceptions.map((exc) => (
                  <button
                    key={exc.id}
                    onClick={() => setSelectedException(exc)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-4 text-left hover:shadow-md transition-all hover:border-slate-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-slate-900">{exc.studentId}</span>
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">{exc.level}</span>
                          {getStatusBadge(exc.status)}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{EXCEPTION_REASONS[exc.reason]}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>{exc.date} • {exc.session}</span>
                          <span>Requested by {exc.requestedBy}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">Details:</p>
                        <p className="text-sm text-slate-700 max-w-xs text-right truncate">{exc.details}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Detail Modal */}
      {selectedException && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 text-white">
              <h2 className="text-xl font-bold">Exception Request Review</h2>
              <p className="text-sm text-slate-300 mt-1">Student ID: {selectedException.studentId}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Request Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Date & Session</p>
                  <p className="text-sm font-medium text-slate-900">{selectedException.date} • {selectedException.session}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Level</p>
                  <p className="text-sm font-medium text-slate-900">{selectedException.level}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Reason</p>
                  <p className="text-sm font-medium text-slate-900">{EXCEPTION_REASONS[selectedException.reason]}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Status</p>
                  <div>{getStatusBadge(selectedException.status)}</div>
                </div>
              </div>

              {/* Details */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Details</p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{selectedException.details}</p>
              </div>

              {/* Requested Info */}
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-600">
                  Requested by <span className="font-semibold">{selectedException.requestedBy}</span> on {selectedException.requestedAt}
                </p>
              </div>

              {/* Review Info (if reviewed) */}
              {selectedException.reviewedBy && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    <span className="font-semibold">{selectedException.reviewedBy}</span> {selectedException.status} on {selectedException.reviewedAt}
                  </p>
                  {selectedException.reviewNotes && (
                    <p className="text-sm text-blue-800 mt-2">Notes: {selectedException.reviewNotes}</p>
                  )}
                </div>
              )}

              {/* Review Form (if pending) */}
              {selectedException.status === 'pending' && (
                <div className="space-y-3 border-t border-slate-200 pt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Review Notes</label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Optional notes for the volunteer..."
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedException(null)}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-60"
                      disabled={isSubmitting}
                    >
                      Close
                    </button>
                    <button
                      onClick={handleReject}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
                      disabled={isSubmitting}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={handleApprove}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2"
                      disabled={isSubmitting}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
