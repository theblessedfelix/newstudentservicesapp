import { useNavigate } from 'react-router';
import AppNavbar from '../../components/AppNavbar';
import PageBackButton from '../../components/PageBackButton';

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
          ctaHref="/admin#/dashboard"
          items={[
            { label: 'Add new student', href: '/admin#/students' },
            { label: 'ID Collection', href: '/admin#/id-cards' },
            { label: 'Volunteer Sign up', href: '/admin#/volunteers' },
            { label: 'Knowledge Based', href: '/admin#/reports' },
            { label: 'RHEMA Website', href: '/admin#/dashboard' },
          ]}
        />

        <main className="max-w-3xl mx-auto py-16">
          <div className="mb-6">
            <PageBackButton onClick={() => navigate('/dashboard')} label="Back to Admin Dashboard" />
          </div>

          <div className="rounded-3xl border border-gray-300 bg-[#efefef] p-8 shadow-sm">
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-[0.25em] mb-3">Module</p>
            <h2 className="text-3xl font-bold mb-3 text-black">{title}</h2>
            <p className="text-slate-700 leading-7 mb-8">{description}</p>
          </div>
        </main>

        <footer className="py-12 text-center">
          <p className="text-slate-500 text-xs">© 2026 Student Services. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
