import { useState } from 'react';
import { CheckCircle, XCircle, Clock, User, MapPin, GraduationCap, Search } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import PageShell from '../../components/PageShell';
import SectionHeading from '../../components/SectionHeading';
import BackButton from '../../components/BackButton';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface PendingRegistration {
  id: number;
  studentId: string;
  name: string;
  level: 'Level 1' | 'Level 2';
  campus: 'Lagos Island' | 'Lagos Mainland';
  submittedBy: string;
  submittedAt: string;
  status: ApprovalStatus;
}

const ADMIN_NAV = [
  { label: 'Student Records', href: '/admin.html#/students' },
  { label: 'ID Collection', href: '/admin.html#/id-cards' },
  { label: 'Volunteer Accounts', href: '/admin.html#/volunteers' },
  { label: 'Reports', href: '/admin.html#/reports' },
  { label: 'Approvals Queue', href: '/admin.html#/approvals' },
];

const TABS: { label: string; value: ApprovalStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

const INITIAL_DATA: PendingRegistration[] = [
  { id: 1, studentId: 'STU-NEW-001', name: 'Emeka Obi', level: 'Level 1', campus: 'Lagos Island', submittedBy: 'VOL001 — Adebayo Lawal', submittedAt: 'Apr 7, 2026 · 8:14 AM', status: 'pending' },
  { id: 2, studentId: 'STU-NEW-002', name: 'Ngozi Eze', level: 'Level 2', campus: 'Lagos Mainland', submittedBy: 'VOL002 — Grace Nnaji', submittedAt: 'Apr 7, 2026 · 8:45 AM', status: 'pending' },
  { id: 3, studentId: 'STU-NEW-003', name: 'Tolu Adeyinka', level: 'Level 1', campus: 'Lagos Island', submittedBy: 'VOL001 — Adebayo Lawal', submittedAt: 'Apr 6, 2026 · 10:30 AM', status: 'pending' },
  { id: 4, studentId: 'STU-NEW-004', name: 'Blessing Okafor', level: 'Level 2', campus: 'Lagos Island', submittedBy: 'VOL004 — Ruth Okafor', submittedAt: 'Apr 5, 2026 · 2:12 PM', status: 'approved' },
  { id: 5, studentId: 'STU-NEW-005', name: 'Kayode Bello', level: 'Level 1', campus: 'Lagos Mainland', submittedBy: 'VOL002 — Grace Nnaji', submittedAt: 'Apr 4, 2026 · 11:55 AM', status: 'rejected' },
];

export default function ApprovalsQueue() {
  const [records, setRecords] = useState<PendingRegistration[]>(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState<ApprovalStatus | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const handleApprove = (id: number, name: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    toast.success(`${name} approved and added to student registry.`);
  };

  const handleReject = (id: number, name: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    toast.error(`${name}'s registration rejected.`);
  };

  const filtered = records.filter(r => {
    const matchesTab = activeTab === 'all' || r.status === activeTab;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || r.name.toLowerCase().includes(q) || r.studentId.toLowerCase().includes(q) || r.submittedBy.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const counts = {
    all: records.length,
    pending: records.filter(r => r.status === 'pending').length,
    approved: records.filter(r => r.status === 'approved').length,
    rejected: records.filter(r => r.status === 'rejected').length,
  };

  const statusConfig = {
    pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    approved: { label: 'Approved', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
    rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-400' },
  };

  return (
    <PageShell ctaHref="/admin.html#/dashboard" navbarItems={ADMIN_NAV}>
      <Toaster position="top-right" richColors />
      <div className="pt-10 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-10">
          <SectionHeading
            title="Approvals Queue"
            subtitle="Review new student registrations submitted by volunteers. Approved entries are added to the student registry."
          />
          <BackButton to="/dashboard" label="Dashboard" className="shrink-0 mt-1" />
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {(['pending', 'approved', 'rejected'] as ApprovalStatus[]).map(s => {
            const cfg = statusConfig[s];
            return (
              <div key={s} className={`rounded-xl border ${cfg.border} ${cfg.bg} px-5 py-4`}>
                <p className={`text-2xl font-black ${cfg.text}`}>{counts[s]}</p>
                <p className={`text-xs font-bold uppercase tracking-widest mt-0.5 ${cfg.text}`}>{cfg.label}</p>
              </div>
            );
          })}
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
            {TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab.value
                    ? 'bg-black text-white'
                    : 'text-slate-500 hover:text-black'
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 text-xs ${activeTab === tab.value ? 'text-orange-300' : 'text-slate-400'}`}>
                  {counts[tab.value as keyof typeof counts]}
                </span>
              </button>
            ))}
          </div>

          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or volunteer…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 bg-white"
            />
          </div>
        </div>

        {/* Records */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <Clock className="w-8 h-8 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500 font-medium">No records match your filter.</p>
            </div>
          )}

          {filtered.map(r => {
            const cfg = statusConfig[r.status];
            return (
              <div
                key={r.id}
                className="bg-white border border-slate-200 rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                {/* Avatar + Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {r.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-black leading-tight">{r.name}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{r.studentId}</p>
                  </div>
                </div>

                {/* Meta chips */}
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    <GraduationCap className="w-3 h-3" /> {r.level}
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    <MapPin className="w-3 h-3" /> {r.campus}
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    <User className="w-3 h-3" /> {r.submittedBy}
                  </span>
                </div>

                {/* Date + Status */}
                <div className="flex items-center gap-3 shrink-0">
                  <p className="text-xs text-slate-400 hidden lg:block">{r.submittedAt}</p>
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </div>

                {/* Actions */}
                {r.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(r.id, r.name)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-orange-400" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(r.id, r.name)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {counts.pending === 0 && activeTab === 'pending' && (
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400 italic">All registrations have been reviewed.</p>
          </div>
        )}
      </div>

      <footer className="py-10 border-t border-slate-100 text-center">
        <p className="italic text-slate-400 text-xs font-serif">"Whatever you do, work at it with all your heart"</p>
      </footer>
    </PageShell>
  );
}
