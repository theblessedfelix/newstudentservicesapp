import { useNavigate } from 'react-router';
import { ChevronRight } from 'lucide-react';
import AppNavbar from '../../components/AppNavbar';

export default function StudentRecordsChoice() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-16">
          <AppNavbar ctaHref="/admin.html#/dashboard" />
        </div>

        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black mb-4">
            View & Manage Student Records
          </h1>
          <p className="text-slate-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Select a level to view student profiles, manage records,
            <br className="hidden sm:block" />
            and review detailed attendance history.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Level 1 Card */}
          <button
            onClick={() => navigate('/students/level-1')}
            className="group text-left rounded-2xl border-2 border-slate-200 bg-white p-8 hover:border-black hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 group-hover:bg-black transition-colors mb-6">
              <span className="text-2xl font-bold text-slate-600 group-hover:text-white transition-colors">1</span>
            </div>
            <h2 className="text-2xl font-bold text-black mb-3">Level 1 Students</h2>
            <p className="text-slate-600 text-base leading-relaxed mb-6">
              View, search, and manage student records and attendance for Level 1.
            </p>
            <div className="flex items-center gap-2 text-black font-semibold group-hover:gap-3 transition-all">
              <span>Proceed</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>

          {/* Level 2 Card */}
          <button
            onClick={() => navigate('/students/level-2')}
            className="group text-left rounded-2xl border-2 border-slate-200 bg-white p-8 hover:border-black hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 group-hover:bg-black transition-colors mb-6">
              <span className="text-2xl font-bold text-slate-600 group-hover:text-white transition-colors">2</span>
            </div>
            <h2 className="text-2xl font-bold text-black mb-3">Level 2 Students</h2>
            <p className="text-slate-600 text-base leading-relaxed mb-6">
              View, search, and manage student records and attendance for Level 2.
            </p>
            <div className="flex items-center gap-2 text-black font-semibold group-hover:gap-3 transition-all">
              <span>Proceed</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
