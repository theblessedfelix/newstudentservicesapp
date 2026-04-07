import { useState } from 'react';
import { Download, Users, TrendingUp, Calendar, Filter } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import PageShell from '../../components/PageShell';
import SectionHeading from '../../components/SectionHeading';
import BackButton from '../../components/BackButton';

const ADMIN_NAV = [
  { label: 'Student Records', href: '/admin.html#/students' },
  { label: 'ID Collection', href: '/admin.html#/id-cards' },
  { label: 'Volunteer Accounts', href: '/admin.html#/volunteers' },
  { label: 'Reports', href: '/admin.html#/reports' },
  { label: 'Approvals Queue', href: '/admin.html#/approvals' },
];

const CAMPUSES = ['All Campuses', 'Lagos Island', 'Lagos Mainland'];
const LEVELS = ['All Levels', 'Level 1', 'Level 2'];

const WEEKLY_SESSIONS = [
  { date: 'Apr 5–6, 2026', sessions: ['Sat Morning', 'Sat Afternoon', 'Sat Evening', 'Sun Afternoon', 'Sun Evening'], present: [14, 11, 10, 12, 9], total: [16, 16, 16, 16, 16] },
  { date: 'Mar 29–30, 2026', sessions: ['Sat Morning', 'Sat Afternoon', 'Sat Evening', 'Sun Afternoon', 'Sun Evening'], present: [15, 13, 11, 14, 10], total: [16, 16, 16, 16, 16] },
  { date: 'Mar 22–23, 2026', sessions: ['Sat Morning', 'Sat Afternoon', 'Sat Evening', 'Sun Afternoon', 'Sun Evening'], present: [13, 12, 10, 11, 9], total: [16, 16, 16, 16, 16] },
];

const LEVEL_SUMMARY = [
  { level: 'Level 1', campus: 'Lagos Island', students: 4, totalSessions: 20, attended: 17, rate: 85 },
  { level: 'Level 1', campus: 'Lagos Mainland', students: 4, totalSessions: 20, attended: 15, rate: 75 },
  { level: 'Level 2', campus: 'Lagos Island', students: 4, totalSessions: 15, attended: 13, rate: 87 },
  { level: 'Level 2', campus: 'Lagos Mainland', students: 4, totalSessions: 15, attended: 12, rate: 80 },
];

const TOP_STUDENTS = [
  { name: 'Adeyemi Okafor', id: 'STU001', level: 'Level 1', campus: 'Lagos Island', rate: 100 },
  { name: 'Chioma Nwosu', id: 'STU002', level: 'Level 1', campus: 'Lagos Mainland', rate: 100 },
  { name: 'Grace Nnaji', id: 'STU004', level: 'Level 1', campus: 'Lagos Mainland', rate: 100 },
  { name: 'Folake Itoro', id: 'STU009', level: 'Level 2', campus: 'Lagos Island', rate: 100 },
  { name: 'Gbemileke Okafor', id: 'STU010', level: 'Level 2', campus: 'Lagos Mainland', rate: 75 },
];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function RateBar({ rate }: { rate: number }) {
  const color = rate >= 80 ? 'bg-green-500' : rate >= 60 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${rate}%` }} />
      </div>
      <span className="text-sm font-bold text-black w-10 text-right">{rate}%</span>
    </div>
  );
}

export default function Reports() {
  const [selectedCampus, setSelectedCampus] = useState('All Campuses');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');

  const filteredSummary = LEVEL_SUMMARY.filter(row =>
    (selectedCampus === 'All Campuses' || row.campus === selectedCampus) &&
    (selectedLevel === 'All Levels' || row.level === selectedLevel)
  );

  const totalStudents = [...new Set(LEVEL_SUMMARY.map(r => r.students))].reduce((a, b) => a + b, 0);
  const totalAttended = LEVEL_SUMMARY.reduce((a, b) => a + b.attended, 0);
  const totalPossible = LEVEL_SUMMARY.reduce((a, b) => a + b.totalSessions, 0);
  const overallRate = totalPossible ? Math.round((totalAttended / totalPossible) * 100) : 0;
  const thisWeek = WEEKLY_SESSIONS[0];
  const thisWeekAttended = thisWeek.present.reduce((a, b) => a + b, 0);
  const thisWeekTotal = thisWeek.total.reduce((a, b) => a + b, 0);

  const handleExport = () => {
    const rows = [
      ['Level', 'Campus', 'Students', 'Sessions', 'Attended', 'Rate'],
      ...filteredSummary.map(r => [r.level, r.campus, r.students, r.totalSessions, r.attended, `${r.rate}%`]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_report.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported as CSV.');
  };

  return (
    <PageShell ctaHref="/admin.html#/dashboard" navbarItems={ADMIN_NAV}>
      <Toaster position="top-right" richColors />
      <div className="pt-10 pb-16 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <SectionHeading
            title="Reports"
            subtitle="Attendance summaries across sessions, levels, and campuses. Export data as CSV for further analysis."
          />
          <BackButton to="/dashboard" label="Dashboard" className="shrink-0 mt-1" />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: totalStudents, icon: <Users className="w-5 h-5" />, sub: 'Across both levels' },
            { label: 'Overall Attendance', value: `${overallRate}%`, icon: <TrendingUp className="w-5 h-5" />, sub: `${totalAttended} of ${totalPossible} sessions` },
            { label: 'Sessions This Weekend', value: thisWeekTotal / 16, icon: <Calendar className="w-5 h-5" />, sub: thisWeek.date },
            { label: 'This Weekend Rate', value: `${Math.round((thisWeekAttended / thisWeekTotal) * 100)}%`, icon: <TrendingUp className="w-5 h-5" />, sub: `${thisWeekAttended} check-ins` },
          ].map(card => (
            <div key={card.label} className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center mb-3">{card.icon}</div>
              <p className="text-2xl font-black text-black">{card.value}</p>
              <p className="text-xs font-bold text-slate-500 mt-0.5 uppercase tracking-wider">{card.label}</p>
              <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Filters + Export */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold shrink-0">
            <Filter className="w-4 h-4" /> Filter by:
          </div>
          <div className="flex flex-wrap gap-2 flex-1">
            <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
              {CAMPUSES.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCampus(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedCampus === c ? 'bg-black text-white' : 'text-slate-500 hover:text-black'}`}
                >{c}</button>
              ))}
            </div>
            <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
              {LEVELS.map(l => (
                <button
                  key={l}
                  onClick={() => setSelectedLevel(l)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedLevel === l ? 'bg-black text-white' : 'text-slate-500 hover:text-black'}`}
                >{l}</button>
              ))}
            </div>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-bold hover:bg-slate-800 transition-colors shrink-0"
          >
            <Download className="w-4 h-4 text-orange-400" />
            Export CSV
          </button>
        </div>

        {/* Attendance by Level & Campus */}
        <div>
          <h2 className="text-lg font-black text-black mb-4">Attendance by Level & Campus</h2>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Level', 'Campus', 'Students', 'Sessions', 'Attended', 'Attendance Rate'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSummary.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-bold text-black">{row.level}</td>
                    <td className="px-5 py-4 text-slate-600">{row.campus}</td>
                    <td className="px-5 py-4 text-slate-700 font-semibold">{row.students}</td>
                    <td className="px-5 py-4 text-slate-600">{row.totalSessions}</td>
                    <td className="px-5 py-4 text-slate-700 font-semibold">{row.attended}</td>
                    <td className="px-5 py-4 w-48"><RateBar rate={row.rate} /></td>
                  </tr>
                ))}
                {filteredSummary.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">No data matches your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Session Breakdown */}
        <div>
          <h2 className="text-lg font-black text-black mb-4">Weekly Session Breakdown</h2>
          <div className="space-y-4">
            {WEEKLY_SESSIONS.map((week, wi) => (
              <div key={wi} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{week.date}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                  {week.sessions.map((session, si) => {
                    const rate = Math.round((week.present[si] / week.total[si]) * 100);
                    return (
                      <div key={si} className="px-4 py-4">
                        <p className="text-xs font-bold text-slate-500 mb-2">{session}</p>
                        <p className="text-xl font-black text-black">{rate}%</p>
                        <p className="text-xs text-slate-400">{week.present[si]} / {week.total[si]}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Students */}
        <div>
          <h2 className="text-lg font-black text-black mb-4">Top Attendance</h2>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="divide-y divide-slate-100">
              {TOP_STUDENTS.map((s, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                  <span className="w-6 text-center text-sm font-bold text-slate-400">{i + 1}</span>
                  <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(s.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-black text-sm">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.id} · {s.level} · {s.campus}</p>
                  </div>
                  <div className="w-32">
                    <RateBar rate={s.rate} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="py-10 border-t border-slate-100 text-center">
        <p className="italic text-slate-400 text-xs font-serif">"Whatever you do, work at it with all your heart"</p>
      </footer>
    </PageShell>
  );
}
