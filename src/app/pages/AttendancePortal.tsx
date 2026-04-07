import { useNavigate } from 'react-router';
import { UserPlus, Settings } from 'lucide-react';
import AppNavbar from '../../components/AppNavbar';

export default function AttendancePortal() {
  const navigate = useNavigate();

  const portals = [
    {
      title: "Volunteer Portal",
      description: "Take attendance and register students for your assigned sessions.",
      path: "/volunteer",
      icon: <UserPlus className="h-10 w-10 text-orange-500" />,
    },
    {
      title: "Admin Portal",
      description: "Manage records, process approvals, generate reports, and oversee ID collections.",
      path: "/admin.html",
      isExternal: true,
      icon: <Settings className="h-10 w-10 text-slate-500" />,
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fb] font-sans antialiased text-slate-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-20">
          <AppNavbar ctaHref="/attendance-portal" />
        </div>

        {/* Hero Section */}
        <main className="flex flex-col items-center justify-center pt-16 pb-20">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-6 text-slate-950">
            Attendance Portal
          </h1>
          <p className="max-w-xl text-center text-slate-500 text-sm md:text-base leading-relaxed px-4 mb-16">
            Choose your portal below. Volunteers manage attendance and student registration.
            Admins handle records, approvals, reports, and ID card collections.
          </p>

          {/* Portal Cards - Standardized Sizing & Icon Geometry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4 mb-24">
            {portals.map((portal) => (
              <article 
                key={portal.title}
                className="group flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 shadow-sm transition-all hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50"
              >
                <div className="mx-auto h-24 w-24 rounded-full border-4 border-slate-100/50 bg-slate-200 flex items-center justify-center mb-8 grayscale group-hover:grayscale-0 transition-transform duration-300 group-hover:scale-105">
                  <div className="h-10 w-10 text-orange-500 group-hover:text-orange-600 transition-colors">
                    {portal.icon}
                  </div>
                </div>

                <h2 className="text-xl font-bold mb-4 text-slate-900 tracking-tight leading-tight">{portal.title}</h2>
                <p className="text-center text-slate-500 text-sm leading-relaxed mb-10 max-w-[220px]">
                  {portal.description}
                </p>

                <button
                  onClick={() => portal.isExternal ? window.location.assign(portal.path) : navigate(portal.path)}
                  className="w-full rounded-xl bg-slate-950 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
                >
                  Get started
                </button>
              </article>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-12 border-t border-slate-100 text-center">
          <p className="italic text-slate-400 text-sm font-serif">
            "Serving the students of RHEMA Bible Training Center"
          </p>
        </footer>
      </div>
    </div>
  );
}