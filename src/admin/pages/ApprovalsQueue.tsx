import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Check, X, Calendar, Search, FileText } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import AppNavbar from '../../components/AppNavbar';
import PageBackButton from '../../components/PageBackButton';
import { approvalService, type ApprovalRequest } from '../../features/approvals/approvalService';
import { useAuth } from '../../features/auth/AuthProvider';

export default function ApprovalsQueue() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'pending' | 'all'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);

  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);

  useEffect(() => {
    if (!session || session.role !== 'admin') {
      navigate('/');
    }
  }, [navigate, session]);

  useEffect(() => {
    const loadApprovals = async () => {
      try {
        const savedApprovals = await approvalService.listApprovals();
        setApprovals(savedApprovals);
      } catch (error) {
        console.error('Error loading approvals:', error);
      }
    };

    void loadApprovals();
    const unsubscribe = approvalService.subscribe(() => {
      void loadApprovals();
    });

    return unsubscribe;
  }, []);

  const filteredApprovals = useMemo(() => {
    return approvals.filter((approval) => {
      const matchStatus = filterStatus === 'all' || approval.status === filterStatus;
      const matchSearch =
        approval.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        approval.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        approval.studentId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [approvals, searchQuery, filterStatus]);

  const handleApprove = async (request: ApprovalRequest) => {
    await approvalService.updateApprovalStatus(request.id, 'approved');
    setApprovals((prev) =>
      prev.map((item) =>
        item.id === request.id ? { ...item, status: 'approved' } : item
      )
    );
    toast.success(`✓ ${request.name} approved and added to student records`);
    setSelectedRequest(null);
  };

  const handleReject = async (request: ApprovalRequest, reason?: string) => {
    await approvalService.updateApprovalStatus(request.id, 'rejected');
    setApprovals((prev) =>
      prev.map((item) =>
        item.id === request.id ? { ...item, status: 'rejected' } : item
      )
    );
    toast.error(`${request.name} registration rejected${reason ? `: ${reason}` : ''}`);
    setSelectedRequest(null);
  };

  const pendingCount = approvals.filter((a) => a.status === 'pending').length;
  const approvedCount = approvals.filter((a) => a.status === 'approved').length;
  const rejectedCount = approvals.filter((a) => a.status === 'rejected').length;

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <Toaster position="top-right" richColors />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-16">
          <AppNavbar ctaHref="/admin.html#/dashboard" />
        </div>

        <div className="mb-8">
          <PageBackButton onClick={() => navigate('/dashboard')} label="Back to Dashboard" />
        </div>

        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black mb-4">
            Approvals Queue
          </h1>
          <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
            Review and approve student registrations submitted by volunteers.
            <br className="hidden sm:block" />
            Make decisions quickly to keep the enrollment process moving.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-amber-100/50 p-6">
            <div className="text-3xl font-bold text-amber-900 mb-1">{pendingCount}</div>
            <p className="text-sm font-medium text-amber-700">Pending Review</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-green-100/50 p-6">
            <div className="text-3xl font-bold text-green-900 mb-1">{approvedCount}</div>
            <p className="text-sm font-medium text-green-700">Approved</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-red-50 to-red-100/50 p-6">
            <div className="text-3xl font-bold text-red-900 mb-1">{rejectedCount}</div>
            <p className="text-sm font-medium text-red-700">Rejected</p>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="mb-10 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or student ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-black text-white'
                  : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterStatus === 'all'
                  ? 'bg-black text-white'
                  : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Approvals List */}
        <div className="space-y-3 mb-12">
          {filteredApprovals.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600 text-lg font-medium">No requests found</p>
              <p className="text-slate-500">There are no registration requests matching your criteria.</p>
            </div>
          ) : (
            filteredApprovals.map((approval) => (
              <div
                key={approval.id}
                onClick={() => setSelectedRequest(approval)}
                className={`rounded-2xl border p-6 cursor-pointer transition-all ${
                  approval.status === 'pending'
                    ? 'border-amber-200 bg-amber-50/50 hover:border-amber-300 hover:shadow-md'
                    : approval.status === 'approved'
                    ? 'border-green-200 bg-green-50/50'
                    : 'border-red-200 bg-red-50/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {getInitials(approval.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-900">{approval.name}</h3>
                      <span
                        className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full ${
                          approval.status === 'pending'
                            ? 'bg-amber-200 text-amber-900'
                            : approval.status === 'approved'
                            ? 'bg-green-200 text-green-900'
                            : 'bg-red-200 text-red-900'
                        }`}
                      >
                        {approval.status}
                      </span>
                    </div>
                    <p className="text-slate-600">{approval.email}</p>
                    <p className="text-sm text-slate-500 mt-2">
                      {approval.level} • {approval.campus}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                      <Calendar className="w-3 h-3" />
                      {approval.submittedAt} by {approval.submittedBy}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {approval.status === 'pending' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleApprove(approval);
                          }}
                          className="w-10 h-10 rounded-lg bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleReject(approval);
                          }}
                          className="w-10 h-10 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Modal */}
        {selectedRequest && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedRequest(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-black p-6 rounded-t-2xl">
                <h2 className="text-white text-2xl font-bold">{selectedRequest.name}</h2>
                <p className="text-slate-300 text-sm mt-1">{selectedRequest.studentId}</p>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</p>
                        <p className="text-slate-900 mt-1">{selectedRequest.email}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Campus</p>
                        <p className="text-slate-900 mt-1">{selectedRequest.campus}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Level</p>
                        <p className="text-slate-900 mt-1">{selectedRequest.level}</p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-200" />

                  {/* Parent/Guardian Information */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Parent/Guardian Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</p>
                        <p className="text-slate-900 mt-1">{selectedRequest.parentGuardian}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</p>
                        <p className="text-slate-900 mt-1">{selectedRequest.parentPhone}</p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-200" />

                  {/* Submission Details */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Submission Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Submitted By</p>
                        <p className="text-slate-900 mt-1">{selectedRequest.submittedBy}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date & Time</p>
                        <p className="text-slate-900 mt-1">{selectedRequest.submittedAt}</p>
                      </div>
                    </div>
                    {selectedRequest.notes && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Notes</p>
                        <p className="text-slate-900 mt-2 bg-slate-100 rounded-lg p-3">"{selectedRequest.notes}"</p>
                      </div>
                    )}
                  </div>

                  <hr className="border-slate-200" />

                  {/* Action Buttons */}
                  {selectedRequest.status === 'pending' && (
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => void handleApprove(selectedRequest)}
                        className="flex-1 px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        Approve Registration
                      </button>
                      <button
                        onClick={() => void handleReject(selectedRequest)}
                        className="flex-1 px-6 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        Reject Registration
                      </button>
                    </div>
                  )}

                  {selectedRequest.status !== 'pending' && (
                    <div className={`p-4 rounded-lg text-center font-semibold ${
                      selectedRequest.status === 'approved'
                        ? 'bg-green-100 text-green-900'
                        : 'bg-red-100 text-red-900'
                    }`}>
                      This request has been {selectedRequest.status}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
