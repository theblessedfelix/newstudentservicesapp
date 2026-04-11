import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, AlertCircle } from 'lucide-react';
import AppNavbar from '../../../components/AppNavbar';
import PageBackButton from '../../../components/PageBackButton';
import { useAuth } from '../../../features/auth/AuthProvider';
import { RequestExceptionModal } from '../../components/RequestExceptionModal';

export default function VolunteerDashboard() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [exceptionModalOpen, setExceptionModalOpen] = useState(false);

  useEffect(() => {
    if (!session || session.role !== 'volunteer') {
      navigate('/volunteer');
    }
  }, [navigate, session]);

  const modules = [
    {
      title: 'Scanner Attendance',
      description: 'Open the QR and student ID scanner for fast attendance check-in.',
      action: () => navigate('/volunteer/attendance'),
      badge: 'Scanner',
      accent: 'from-orange-50 to-orange-100',
    },
    {
      title: 'Register Student',
      description: 'Create and submit a new student registration for approval.',
      action: () => navigate('/volunteer/register'),
      badge: 'Intake',
      accent: 'from-amber-50 to-amber-100',
    },
    {
      title: 'Student Records',
      description: 'View student records. Choose level first.',
      action: () => navigate('/volunteer/student-records-choice'),
      badge: 'Records',
      accent: 'from-emerald-50 to-emerald-100',
    },
    {
      title: 'Attendance History',
      description: 'Review previous check-ins, attendance trends, and student history.',
      action: () => navigate('/volunteer/history'),
      badge: 'History',
      accent: 'from-violet-50 to-violet-100',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f2f2f5] text-slate-900 antialiased">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <AppNavbar ctaHref="/attendance-portal" />

        <main className="pt-16 pb-10">
          <div className="mb-8">
            <PageBackButton onClick={() => navigate('/attendance-portal')} label="Back to Portal" />
          </div>

          <section className="text-center">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Volunteer Dashboard</h1>
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
                className={`group relative rounded-2xl border border-slate-300 bg-white p-7 min-h-[190px] flex flex-col text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-slate-400 cursor-pointer ${
                  module.title === 'Scanner Attendance' || module.title === 'Attendance History' ? 'md:col-span-2 min-h-[220px] overflow-hidden' : ''
                }`}
                aria-label={`Open ${module.title}`}
              >
                <div className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r ${module.accent}`} />
                <div className={`flex-1 ${module.title === 'Scanner Attendance' || module.title === 'Attendance History' ? 'md:grid md:grid-cols-[72px_minmax(0,1fr)] md:gap-6 md:items-center' : 'flex items-start gap-4'}`}>
                  <div className={`mt-1 rounded-xl bg-slate-900 text-white text-[10px] font-bold tracking-wide flex items-center justify-center uppercase ${
                    module.title === 'Scanner Attendance' || module.title === 'Attendance History' ? 'h-14 w-14 mb-5 md:mb-0 md:mt-0 md:h-16 md:w-16 self-center' : 'h-11 min-w-11'
                  }`}>
                    {module.badge.slice(0, 3)}
                  </div>
                  <div className={module.title === 'Scanner Attendance' || module.title === 'Attendance History' ? 'max-w-2xl text-left self-center' : ''}>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{module.badge}</p>
                    <h2 className={`${module.title === 'Scanner Attendance' || module.title === 'Attendance History' ? 'text-2xl sm:text-3xl' : 'text-xl'} font-bold text-black`}>
                      {module.title}
                    </h2>
                    <p className={`mt-2 text-slate-700 leading-relaxed ${module.title === 'Scanner Attendance' || module.title === 'Attendance History' ? 'text-base max-w-2xl' : 'text-sm max-w-[34ch]'}`}>
                      {module.description}
                    </p>
                  </div>
                </div>

                <div className={`flex mt-5 ${module.title === 'Scanner Attendance' || module.title === 'Attendance History' ? 'justify-start md:justify-end' : 'justify-end'}`}>
                  <div className={`${module.title === 'Scanner Attendance' || module.title === 'Attendance History' ? 'h-11 w-11' : 'h-9 w-9'} rounded-lg bg-black text-white flex items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5`}>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            ))}
          </section>
        </main>

        <div className="mt-12 flex justify-center gap-3 flex-wrap">
          <button
            onClick={() => setExceptionModalOpen(true)}
            className="rounded-md bg-orange-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-orange-700 transition-colors cursor-pointer flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Request Exception
          </button>
        </div>
      </div>

      <RequestExceptionModal
        isOpen={exceptionModalOpen}
        onClose={() => setExceptionModalOpen(false)}
        defaultLevel="Level 1"
      />
    </div>
  );
}