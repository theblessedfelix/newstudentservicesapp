import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import AppNavbar from '../../components/AppNavbar';

type AdminModulePageProps = {
  title: string;
  description: string;
};

export default function AdminModulePage({ title, description }: AdminModulePageProps) {
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

        <main className="max-w-3xl mx-auto py-16">
          <div className="rounded-3xl border border-gray-300 bg-[#efefef] p-8 shadow-sm">
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-[0.25em] mb-3">Module</p>
            <h2 className="text-3xl font-bold mb-3 text-black">{title}</h2>
            <p className="text-slate-700 leading-7 mb-8">{description}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-white font-semibold hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin Dashboard
            </button>
          </div>
        </main>

        <footer className="py-12 text-center">
          <p className="italic text-gray-400 text-xs font-serif">
            "Whatever you do, work at it with all your heart"
          </p>
        </footer>
      </div>
    </div>
  );
}
