import { useNavigate } from 'react-router';
import { Shield, ArrowRight } from 'lucide-react';
import AppNavbar from '../../components/AppNavbar';

export default function AdminLogin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f2f2f5] text-slate-900 antialiased">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <AppNavbar
          ctaHref="/admin.html#/dashboard"
          items={[
            { label: 'Student Records', href: '/admin.html#/students' },
            { label: 'ID Collection', href: '/admin.html#/id-cards' },
            { label: 'Volunteer Accounts', href: '/admin.html#/volunteers' },
            { label: 'Reports', href: '/admin.html#/reports' },
            { label: 'Approvals Queue', href: '/admin.html#/approvals' },
          ]}
        />

        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="w-full max-w-xl rounded-3xl border border-gray-300 bg-[#efefef] p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500 font-semibold">Admin Portal</p>
                <h1 className="text-3xl font-bold text-black">Bible School</h1>
              </div>
            </div>

            <p className="text-slate-700 mb-8 leading-7">
              Sign in to manage records, process approvals, run reports, and maintain ID collection workflows.
            </p>

            <div className="space-y-4">
              <div className="rounded-xl border border-gray-300 bg-white p-4 text-sm text-slate-600">
                Demo access is intentionally kept simple in this UI bundle.
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full rounded-xl bg-black px-5 py-3 text-white font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                Enter Admin Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
