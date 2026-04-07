import { useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import AppNavbar from '../../components/AppNavbar';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'View & Manage Student Records',
      description: 'View, import, and maintain the student registry.',
      action: () => navigate('/students'),
    },
    {
      title: 'View & Generate Reports',
      description: 'Generate session and summary reports with CSV export.',
      action: () => navigate('/reports'),
    },
    {
      title: 'Volunteer Management',
      description: 'Create, deactivate, and reset volunteer accounts.',
      action: () => navigate('/volunteers'),
    },
    {
      title: 'ID Card Management',
      description: 'Track collection status and manage production flow.',
      action: () => navigate('/id-cards'),
    },
  ];

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

        <main className="pt-16 pb-10">
          <section className="text-center">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Admin Dashboard</h1>
            <p className="mt-5 text-slate-700 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Manage student records, review registrations, generate reports,
              <br className="hidden sm:block" />
              and oversee volunteer accounts and ID card collections.
            </p>
          </section>

          <section className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {modules.map((module) => (
              <article
                key={module.title}
                className="rounded-lg border border-gray-300 bg-[#efefef] p-7 min-h-[170px] flex flex-col"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1 h-10 w-10 rounded-full bg-gray-300 shrink-0" />
                  <div>
                    <h2 className="text-xl font-bold text-black">{module.title}</h2>
                    <p className="mt-2 text-sm text-slate-700 leading-relaxed max-w-[30ch]">{module.description}</p>
                  </div>
                </div>

                <div className="flex justify-end mt-5">
                  <button
                    onClick={module.action}
                    className="h-7 w-7 rounded-md bg-black text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
                    aria-label={`Open ${module.title}`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))}
          </section>

          <div className="mt-16 flex justify-center gap-3 flex-wrap">
            <button
              onClick={() => navigate('/approvals')}
              className="rounded-md bg-white border border-gray-300 text-slate-800 px-5 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Open Approvals Queue
            </button>
            <button
              onClick={() => navigate('/import')}
              className="rounded-md bg-white border border-gray-300 text-slate-800 px-5 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Open CSV Import
            </button>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-3 rounded-md bg-black text-white px-10 py-3 text-2xl font-medium hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
              <span>Back</span>
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
