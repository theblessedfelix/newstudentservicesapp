import { useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import AppNavbar from '../../../components/AppNavbar';

export default function VolunteerDashboard() {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Level 1 Sessions',
      description: 'Select a weekend session and take attendance for Level 1 students.',
      action: () => navigate('/volunteer/level-1'),
    },
    {
      title: 'Level 2 Sessions',
      description: 'Select a weekend session and take attendance for Level 2 students.',
      action: () => navigate('/volunteer/level-2'),
    },
    {
      title: 'Register Student',
      description: 'Submit a new student registration for admin approval.',
      action: () => navigate('/volunteer/register'),
    },
    {
      title: 'Student Records',
      description: 'Search and view student attendance records by level.',
      action: () => navigate('/volunteer/student-records-choice'),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f2f2f5] text-slate-900 antialiased">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <AppNavbar ctaHref="/attendance-portal" />

        <main className="pt-16 pb-10">
          <section className="text-center">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Volunteer Dashboard</h1>
            <p className="mt-5 text-slate-700 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Welcome. Use the modules below to take attendance, register students,
              <br className="hidden sm:block" />
              or look up student records for your assigned sessions.
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
                    <p className="mt-2 text-sm text-slate-700 leading-relaxed max-w-[28ch]">{module.description}</p>
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

          <div className="mt-16 flex justify-center">
            <button
              onClick={() => navigate('/attendance-portal')}
              className="inline-flex items-center gap-3 rounded-md bg-black text-white px-10 py-3 text-2xl font-medium hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
              <span>Back</span>
            </button>
          </div>
        </main>

       
      </div>
    </div>
  );
}