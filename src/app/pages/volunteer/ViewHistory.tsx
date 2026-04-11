import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { BookOpen, Search, Calendar, CheckCircle, XCircle, X, ChevronRight } from 'lucide-react';
import AppNavbar from '../../../components/AppNavbar';
import PageBackButton from '../../../components/PageBackButton';
import { attendanceService, type AttendanceRecord as PersistedAttendanceRecord } from '../../../features/attendance/attendanceService';
import { useAuth } from '../../../features/auth/AuthProvider';
import { buildStudentDirectory } from '../../../features/students/studentDirectory';
import { studentService, type StudentRecord as PersistedStudent } from '../../../features/students/studentService';
import type { AttendanceLevelId } from './attendanceConfig';

interface AttendanceRecord {
  date: string;
  session: string;
  present: boolean;
}

interface Student {
  id: string;
  studentId: string;
  name: string;
  initials: string;
  level: AttendanceLevelId;
  attendanceRecords: AttendanceRecord[];
}

const STUDENTS_PER_PAGE = 12;

const HISTORY_LEVEL_OPTIONS: Array<{ id: AttendanceLevelId; slug: string; title: string; description: string }> = [
  {
    id: 'Level 1',
    slug: 'level-1',
    title: 'Level 1 History',
    description: 'Open attendance history for Level 1 students only.',
  },
  {
    id: 'Level 2',
    slug: 'level-2',
    title: 'Level 2 History',
    description: 'Open attendance history for Level 2 students only.',
  },
];

function getLevelFromSlug(levelId?: string): AttendanceLevelId | null {
  if (levelId === 'level-1') {
    return 'Level 1';
  }

  if (levelId === 'level-2') {
    return 'Level 2';
  }

  return null;
}

export default function ViewHistory() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { levelId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const selectedLevel = getLevelFromSlug(levelId);

  useEffect(() => {
    if (!session || session.role !== 'volunteer') {
      navigate('/volunteer');
    }
  }, [navigate, session]);

  useEffect(() => {
    const getInitials = (name: string) =>
      name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');

    const formatSession = (session: string) =>
      session
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

    const loadHistory = async () => {
      try {
        const [allStudents, allAttendance] = await Promise.all([
          studentService.listStudents(),
          attendanceService.listAttendanceRecords(),
        ]);

        const studentDirectory = buildStudentDirectory(allStudents as PersistedStudent[]);
        const studentMap = new Map<string, Student>();

        for (const record of allAttendance as PersistedAttendanceRecord[]) {
          const info = studentDirectory[record.studentId];
          const existing = studentMap.get(record.studentId);

          if (!existing) {
            const resolvedName = info?.name ?? `Student ${record.studentId}`;
            const resolvedLevel = info?.level ?? 'Level 1';
            studentMap.set(record.studentId, {
              id: record.studentId,
              studentId: record.studentId,
              name: resolvedName,
              initials: getInitials(resolvedName) || 'ST',
              level: resolvedLevel,
              attendanceRecords: [
                {
                  date: record.date,
                  session: formatSession(record.session),
                  present: record.status === 'present',
                },
              ],
            });
            continue;
          }

          existing.attendanceRecords.push({
            date: record.date,
            session: formatSession(record.session),
            present: record.status === 'present',
          });
        }

        const hydratedStudents = Array.from(studentMap.values()).map((student) => ({
          ...student,
          attendanceRecords: [...student.attendanceRecords].sort((a, b) => b.date.localeCompare(a.date)),
        }))
          .sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: 'base' }));

        setStudents(hydratedStudents);
      } catch (error) {
        console.error('Failed to load attendance history', error);
      }
    };

    void loadHistory();
    return attendanceService.subscribe(() => {
      void loadHistory();
    });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLevel]);

  useEffect(() => {
    if (!selectedStudent) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedStudent]);

  const filteredStudents = useMemo(
    () => students.filter(
      (student) =>
        (!selectedLevel || student.level === selectedLevel) &&
        (
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
        )
    ),
    [searchQuery, selectedLevel, students],
  );

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE));

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;
    return filteredStudents.slice(startIndex, startIndex + STUDENTS_PER_PAGE);
  }, [currentPage, filteredStudents]);

  const calculateAttendanceRate = (records: AttendanceRecord[]) => {
    if (records.length === 0) return 0;
    const presentCount = records.filter((r) => r.present).length;
    return Math.round((presentCount / records.length) * 100);
  };

  const getRateTone = (rate: number) => {
    if (rate >= 80) return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    if (rate >= 50) return 'bg-amber-100 text-amber-800 border border-amber-200';
    return 'bg-rose-100 text-rose-800 border border-rose-200';
  };

  if (!levelId) {
    return (
      <div className="min-h-screen bg-[#f2f2f5] text-slate-900 antialiased">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <AppNavbar ctaHref="/attendance-portal" />

          <main className="pt-16 pb-10">
            <div className="mb-8">
              <PageBackButton onClick={() => navigate('/volunteer/dashboard')} label="Back to Dashboard" />
            </div>

            <section className="text-center">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-black">Choose History Level</h1>
              <p className="mt-5 text-slate-700 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                Select the level whose attendance history you want to review.
              </p>
            </section>

            <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {HISTORY_LEVEL_OPTIONS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => navigate(`/volunteer/history/${level.slug}`)}
                  className="group text-left rounded-2xl border-2 border-slate-200 bg-white p-8 hover:border-black hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 group-hover:bg-black transition-colors mb-6">
                    <span className="text-2xl font-bold text-slate-600 group-hover:text-white transition-colors">
                      {level.id === 'Level 1' ? '1' : '2'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-black mb-3">{level.title}</h2>
                  <p className="text-slate-600 text-base leading-relaxed mb-6">{level.description}</p>
                  <div className="flex items-center gap-2 text-black font-semibold group-hover:gap-3 transition-all">
                    <span>Proceed</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
              ))}
            </section>
          </main>
        </div>
      </div>
    );
  }

  if (!selectedLevel) {
    return (
      <div className="min-h-screen bg-[#f2f2f5] text-slate-900 antialiased">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <AppNavbar ctaHref="/attendance-portal" />

          <main className="pt-16 pb-10">
            <div className="mb-8">
              <PageBackButton onClick={() => navigate('/volunteer/history')} label="Back to History Levels" />
            </div>

            <div className="mt-16 rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
              <p className="text-slate-900 text-xl font-bold">Invalid history level</p>
              <p className="mt-2 text-slate-600">Choose Level 1 or Level 2 to continue.</p>
              <button
                onClick={() => navigate('/volunteer/history')}
                className="mt-6 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Go to History Levels
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f5] text-slate-900 antialiased">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <AppNavbar ctaHref="/attendance-portal" />

        <main className="pt-16 pb-10">
          <div className="mb-8">
            <PageBackButton onClick={() => navigate('/volunteer/history')} label="Back to History Levels" />
          </div>

          <section className="text-center">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-black">{selectedLevel} Attendance History</h1>
            <p className="mt-5 text-slate-700 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Review student attendance records for {selectedLevel.toLowerCase()}, compare participation rates,
              <br className="hidden sm:block" />
              and open detailed history without an endless list.
            </p>
          </section>

          <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none transition-colors"
                  placeholder="Search by name or student ID..."
                />
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                Showing {paginatedStudents.length} of {filteredStudents.length} students
              </div>
            </div>
          </section>

          <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedStudents.map((student) => {
              const rate = calculateAttendanceRate(student.attendanceRecords);
              return (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className="group relative rounded-2xl border border-slate-300 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-400 hover:shadow-xl cursor-pointer"
                >
                  <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-violet-50 to-violet-100" />
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-bold tracking-wide shadow-sm">
                        {student.initials}
                      </div>
                      <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">History</p>
                        <h2 className="text-xl font-bold text-black leading-tight">{student.name}</h2>
                        <p className="mt-1 text-sm text-slate-500">ID: {student.studentId}</p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{student.level}</p>
                      </div>
                    </div>
                    <div className={`rounded-xl px-3 py-2 text-sm font-bold ${getRateTone(rate)}`}>
                      {rate}%
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-200">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Sessions</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">{student.attendanceRecords.length}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Present</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {student.attendanceRecords.filter((record) => record.present).length}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                    <span>Open full record</span>
                    <BookOpen className="w-4 h-4 text-slate-800 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </button>
              );
            })}
          </section>

          {filteredStudents.length > 0 && totalPages > 1 && (
            <section className="mt-10 flex items-center justify-center gap-3">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <div className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </section>
          )}

          {filteredStudents.length === 0 && (
            <div className="mt-10 rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
              <p className="text-slate-600 font-medium">No attendance records found for this search.</p>
            </div>
          )}
        </main>

        <footer className="py-8 text-center">
          <p className="text-slate-500 text-xs">© 2026 Student Services. All rights reserved.</p>
        </footer>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-black p-6 rounded-t-2xl relative">
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                <div className="w-18 h-18 min-w-18 rounded-2xl bg-white flex items-center justify-center text-black shadow-lg text-2xl font-bold">
                  {selectedStudent.initials}
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">Attendance History</p>
                  <h3 className="text-white text-2xl sm:text-3xl font-bold leading-tight">{selectedStudent.name}</h3>
                  <p className="text-slate-300 mt-1">ID: {selectedStudent.studentId}</p>
                </div>
                <div className={`rounded-xl px-4 py-3 text-lg font-bold shadow-lg ${getRateTone(calculateAttendanceRate(selectedStudent.attendanceRecords))} bg-white`}>
                  {calculateAttendanceRate(selectedStudent.attendanceRecords)}%
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto overscroll-contain max-h-[calc(85vh-132px)]">
              <div className="mb-5 flex items-center gap-2 text-slate-900">
                <Calendar className="w-5 h-5 text-slate-700" />
                <h4 className="text-lg font-bold">
                  Attendance History ({selectedStudent.attendanceRecords.length} sessions)
                </h4>
              </div>

              <div className="space-y-3">
                {selectedStudent.attendanceRecords.map((record, index) => (
                  <div
                    key={index}
                    className={`rounded-xl border p-4 ${record.present ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${record.present ? 'bg-emerald-600' : 'bg-rose-500'}`}>
                          {record.present ? <CheckCircle className="w-6 h-6 text-white" /> : <XCircle className="w-6 h-6 text-white" />}
                        </div>
                        <div>
                          <h5 className="text-slate-900 text-base font-semibold">{record.session}</h5>
                          <p className="text-sm text-slate-600 mt-1">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold ${record.present ? 'bg-white text-emerald-800 border border-emerald-200' : 'bg-white text-rose-800 border border-rose-200'}`}>
                        {record.present ? 'Present' : 'Absent'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
