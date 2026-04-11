import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Lock, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AppNavbar from '../../components/AppNavbar';
import PageBackButton from '../../components/PageBackButton';
import { useAuth } from '../../features/auth/AuthProvider';
import { QuickSessionBlocker } from '../components/QuickSessionBlocker';
import { attendanceService } from '../../features/attendance/attendanceService';
import { sessionService } from '../../features/sessions/sessionService';
import { exceptionService } from '../../features/exceptions/exceptionService';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (!session || session.role !== 'admin') {
      navigate('/');
    }
  }, [navigate, session]);

  const handleClearAllHistory = async () => {
    setIsClearing(true);
    try {
      // Clear all records from localStorage
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (
          key.startsWith('app_setting_') ||
          key.startsWith('attendance-') ||
          key.startsWith('session-') ||
          key.startsWith('exception-') ||
          key === 'app-settings'
        ) {
          localStorage.removeItem(key);
        }
      });

      toast.success('✓ All history cleared. System reset for testing.');
      setShowClearConfirm(false);
    } catch (error) {
      toast.error('Failed to clear history');
      console.error(error);
    } finally {
      setIsClearing(false);
    }
  };

  const modules = [
    {
      title: 'View & Manage Student Records',
      description: 'View, import, and maintain the student registry.',
      action: () => navigate('/students'),
      accent: 'from-slate-100 to-slate-200',
      badge: 'Records',
    },
    {
      title: 'View & Generate Reports',
      description: 'Generate session and summary reports with CSV export.',
      action: () => navigate('/reports'),
      accent: 'from-blue-50 to-blue-100',
      badge: 'Insights',
    },
    {
      title: 'Session Management',
      description: 'Close attendance sessions and manage check-in exceptions.',
      action: () => navigate('/sessions'),
      accent: 'from-red-50 to-red-100',
      badge: 'Control',
    },
    {
      title: 'Exception Requests',
      description: 'Review and approve attendance exceptions from volunteers.',
      action: () => navigate('/exceptions'),
      accent: 'from-orange-50 to-orange-100',
      badge: 'Requests',
    },
    {
      title: 'Volunteer Management',
      description: 'Create, deactivate, and reset volunteer accounts.',
      action: () => navigate('/volunteers'),
      accent: 'from-emerald-50 to-emerald-100',
      badge: 'People',
    },
    {
      title: 'ID Card Management',
      description: 'Track collection status and manage production flow.',
      action: () => navigate('/id-cards'),
      accent: 'from-amber-50 to-amber-100',
      badge: 'Logistics',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f2f2f5] text-slate-900 antialiased">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <AppNavbar
          ctaHref="/admin#/dashboard"
          items={[
            { label: 'Add new student', href: '/admin#/students' },
            { label: 'ID Collection', href: '/admin#/id-cards' },
            { label: 'Volunteer Sign up', href: '/admin#/volunteers' },
            { label: 'Knowledge Based', href: '/admin#/reports' },
            { label: 'RHEMA Website', href: '/admin.html#/dashboard' },
          ]}
        />

        <main className="pt-16 pb-10">
          <div className="mb-8">
            <PageBackButton onClick={() => navigate('/')} label="Back to Home" />
          </div>

          <section className="text-center">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Admin Dashboard</h1>
            <p className="mt-5 text-slate-700 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Offline-first student attendance and records platform designed
              <br className="hidden sm:block" />
              for Bible School operations. Fast, reliable, and built for weekend sessions
            </p>
          </section>

          <section className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {modules.map((module) => (
              <button
                key={module.title}
                onClick={module.action}
                className="group relative rounded-2xl border border-slate-300 bg-white p-7 min-h-[190px] flex flex-col text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-slate-400 cursor-pointer"
                aria-label={`Open ${module.title}`}
              >
                <div className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r ${module.accent}`} />
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1 h-11 min-w-11 rounded-xl bg-slate-900 text-white text-xs font-bold tracking-wide flex items-center justify-center">
                    {module.badge.slice(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{module.badge}</p>
                    <h2 className="text-xl font-bold text-black">{module.title}</h2>
                    <p className="mt-2 text-sm text-slate-700 leading-relaxed max-w-[34ch]">{module.description}</p>
                  </div>
                </div>

                <div className="flex justify-end mt-5">
                  <div className="h-9 w-9 rounded-lg bg-black text-white flex items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            ))}
          </section>

          <section className="mt-16 max-w-4xl mx-auto">
            <QuickSessionBlocker />
          </section>

          <div className="mt-16 flex justify-center gap-3 flex-wrap">
            <button
              onClick={() => navigate('/approvals')}
              className="rounded-md bg-white border border-gray-300 text-slate-800 px-5 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Open Approvals Queue
            </button>
            <button
              onClick={() => navigate('/exceptions')}
              className="rounded-md bg-white border border-gray-300 text-slate-800 px-5 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Open Exception Queue
            </button>
            <button
              onClick={() => navigate('/import')}
              className="rounded-md bg-white border border-gray-300 text-slate-800 px-5 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Open CSV Import
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="rounded-md bg-red-50 border border-red-300 text-red-700 px-5 py-2.5 text-sm font-semibold hover:bg-red-100 transition-colors cursor-pointer flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All History (Testing)
            </button>
          </div>

          {/* Clear All History Confirmation Dialog */}
          {showClearConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
              <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-red-100 p-5">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h3 className="text-lg font-bold text-slate-900">Clear All History?</h3>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <p className="text-sm text-slate-700">
                    This will permanently delete all attendance records, session locks, and exception requests from this device.
                  </p>
                  <p className="text-sm text-red-600 font-semibold">
                    This action cannot be undone. Use only for testing purposes.
                  </p>
                </div>

                <div className="flex gap-3 border-t border-red-100 p-4">
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
                    disabled={isClearing}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllHistory}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
                    disabled={isClearing}
                  >
                    <Trash2 className="w-4 h-4" />
                    {isClearing ? 'Clearing...' : 'Clear All'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="py-12 text-center">
          <p className="text-slate-500 text-xs">© 2026 Student Services. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
