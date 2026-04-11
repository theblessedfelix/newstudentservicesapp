import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Download, TrendingUp, Users, Calendar, BarChart3 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import AppNavbar from '../../components/AppNavbar';
import PageBackButton from '../../components/PageBackButton';
import { attendanceService } from '../../features/attendance/attendanceService';
import { useAuth } from '../../features/auth/AuthProvider';
import { studentService } from '../../features/students/studentService';
import { getLevel1ScannerStudents } from '../../app/data/level1StudentRegistry';
import { ATTENDANCE_LEVEL_MAP, type AttendanceLevelId } from '../../app/pages/volunteer/attendanceConfig';
import { buildStudentDirectory } from '../../features/students/studentDirectory';
import {
  buildStudentSummaries,
  buildVolunteerSummaries,
  type StudentSummary,
  type VolunteerSummary,
} from '../../features/reports/reporting';

interface SessionReport {
  date: string;
  session: string;
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  attendance: number;
  volunteer: string;
}

interface AttendanceRecord {
  id: number;
  studentId: string;
  date: string;
  session: string;
  status: 'present' | 'absent';
  volunteer: string;
  volunteerId: string;
}

interface PersistedStudent {
  id: number;
  studentId: string;
  name: string;
  level: AttendanceLevelId;
}

interface SessionExportProfile {
  key: 'morning' | 'afternoon' | 'signout';
  label: string;
  filenamePrefix: string;
  headers: string[];
  eligibleLevels: AttendanceLevelId[];
  matches: (sessionName: string) => boolean;
}

const SESSION_EXPORT_PROFILES: SessionExportProfile[] = [
  {
    key: 'morning',
    label: 'Morning session',
    filenamePrefix: 'morning-session-report',
    headers: ['Session 1', 'Session 2', 'Session 3'],
    eligibleLevels: ['Level 1'],
    matches: (sessionName) => sessionName.toLowerCase().includes('morning'),
  },
  {
    key: 'afternoon',
    label: 'Afternoon',
    filenamePrefix: 'afternoon-session-report',
    headers: ['S4', 'S5', 'S6'],
    eligibleLevels: ['Level 1', 'Level 2'],
    matches: (sessionName) => sessionName.toLowerCase().includes('afternoon'),
  },
  {
    key: 'signout',
    label: 'Sign out',
    filenamePrefix: 'signout-session-report',
    headers: ['S7', 'S8'],
    eligibleLevels: ['Level 1', 'Level 2'],
    matches: (sessionName) => sessionName.toLowerCase().includes('signout'),
  },
];

export default function Reports() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [reportType, setReportType] = useState<'sessions' | 'students' | 'volunteers'>('sessions');
  const [dateRange, setDateRange] = useState({ start: '2026-03-01', end: '2026-04-10' });
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [persistedStudents, setPersistedStudents] = useState<PersistedStudent[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<AttendanceLevelId | null>(null);

  useEffect(() => {
    if (!session || session.role !== 'admin') {
      navigate('/');
    }
  }, [navigate, session]);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        const [records, students] = await Promise.all([
          attendanceService.listAttendanceRecords(),
          studentService.listStudents(),
        ]);

        setAttendanceRecords(records as AttendanceRecord[]);
        setPersistedStudents(students as PersistedStudent[]);
      } catch (error) {
        console.error('Error loading report data:', error);
      }
    };

    void loadReportData();
    const unsubscribeAttendance = attendanceService.subscribe(() => {
      void loadReportData();
    });
    const unsubscribeStudents = studentService.subscribe(() => {
      void loadReportData();
    });

    return () => {
      unsubscribeAttendance();
      unsubscribeStudents();
    };
  }, []);

  const exportToCSV = (data: Record<string, string | number>[], filename: string) => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const escapeCsvValue = (value: string | number) => {
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const rows = data.map((item) => headers.map((header) => escapeCsvValue(item[header] ?? '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    toast.success(`✓ Exported ${filename}`);
  };

  const knownStudentIdsByLevel = useMemo(() => {
    const level1Ids = getLevel1ScannerStudents().map((student) => student.studentId);
    const persistedLevel2Ids = persistedStudents
      .filter((student) => student.level === 'Level 2')
      .map((student) => student.studentId);
    const fallbackLevel2Ids = ATTENDANCE_LEVEL_MAP['Level 2'].getStudents().map((student) => student.studentId);

    return {
      'Level 1': Array.from(new Set(level1Ids)),
      'Level 2': Array.from(new Set([...persistedLevel2Ids, ...fallbackLevel2Ids])),
    } satisfies Record<AttendanceLevelId, string[]>;
  }, [persistedStudents]);

  const studentDirectory = useMemo(() => buildStudentDirectory(persistedStudents), [persistedStudents]);

  const studentSummaries = useMemo<StudentSummary[]>(
    () => buildStudentSummaries(attendanceRecords, studentDirectory, knownStudentIdsByLevel),
    [attendanceRecords, knownStudentIdsByLevel, studentDirectory],
  );

  const volunteerSummaries = useMemo<VolunteerSummary[]>(
    () => buildVolunteerSummaries(attendanceRecords),
    [attendanceRecords],
  );

  const exportSessionMatrix = (
    profile: SessionExportProfile,
    scope?: {
      date?: string;
      session?: string;
      level?: AttendanceLevelId;
    },
  ) => {
    const matchingRecords = attendanceRecords
      .filter((record) => profile.matches(record.session))
      .filter((record) => (scope?.date ? record.date === scope.date : true))
      .filter((record) => (scope?.session ? record.session === scope.session : true))
      .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());

    // Filter by level if specified
    const levelStudentIds = scope?.level ? knownStudentIdsByLevel[scope.level] : [];
    const recordsFilteredByLevel = scope?.level 
      ? matchingRecords.filter((record) => levelStudentIds.includes(record.studentId))
      : matchingRecords;

    // Export only students that have logs for this exact session scope.
    const studentIds = Array.from(new Set(recordsFilteredByLevel.map((record) => record.studentId)))
      .sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' }));

    if (studentIds.length === 0) {
      toast.error(`No ${profile.label.toLowerCase()} data to export`);
      return;
    }

    const rows = studentIds.map((studentId) => {
      const studentRecords = recordsFilteredByLevel.filter((record) => record.studentId === studentId);
      const isPresentForSession = studentRecords.some((record) => record.status === 'present');
      const row: Record<string, string> = { 'Student ID': studentId };

      // Apply one attendance outcome across all columns for this session export.
      profile.headers.forEach((header) => {
        row[header] = isPresentForSession ? 'True' : 'False';
      });

      return row;
    });

    const scopedDateSuffix = scope?.date
      ? scope.date.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase()
      : new Date().toISOString().split('T')[0];
    const scopedSessionSuffix = scope?.session
      ? scope.session.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase()
      : 'all';
    const scopedLevelSuffix = scope?.level
      ? scope.level.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase()
      : 'all-levels';

    exportToCSV(rows, `${profile.filenamePrefix}-${scopedLevelSuffix}-${scopedSessionSuffix}-${scopedDateSuffix}.csv`);
  };

  const getProfileForSession = (sessionName: string) => {
    return SESSION_EXPORT_PROFILES.find((profile) => profile.matches(sessionName));
  };

  const buildSessionReportsForLevel = (level: AttendanceLevelId): SessionReport[] => {
    if (attendanceRecords.length === 0) {
      return [];
    }

    const grouped = attendanceRecords.reduce<Record<string, AttendanceRecord[]>>((acc, record) => {
      const key = `${record.date}__${record.session}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(record);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([key, records]) => {
        const [date, session] = key.split('__');
        const profile = getProfileForSession(session);
        if (profile && !profile.eligibleLevels.includes(level)) {
          return null;
        }

        const filteredRecords = records.filter((record) => knownStudentIdsByLevel[level].includes(record.studentId));
        const totalStudents = knownStudentIdsByLevel[level].length;
        const presentStudents = new Set(
          filteredRecords.filter((record) => record.status === 'present').map((record) => record.studentId),
        ).size;
        const absentStudents = Math.max(totalStudents - presentStudents, 0);
        const attendance = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;

        return {
          date,
          session,
          totalStudents,
          presentStudents,
          absentStudents,
          attendance,
          volunteer: filteredRecords[0]?.volunteer ?? records[0]?.volunteer ?? 'Volunteer',
        } satisfies SessionReport;
      })
      .filter((report): report is SessionReport => report !== null)
      .sort((left, right) => {
        if (left.date === right.date) {
          return left.session.localeCompare(right.session);
        }
        return right.date.localeCompare(left.date);
      });
  };

  const sessionReportsByLevel = useMemo<Record<AttendanceLevelId, SessionReport[]>>(
    () => ({
      'Level 1': buildSessionReportsForLevel('Level 1'),
      'Level 2': buildSessionReportsForLevel('Level 2'),
    }),
    [attendanceRecords, knownStudentIdsByLevel],
  );

  const allSessionReports = useMemo(
    () => [...sessionReportsByLevel['Level 1'], ...sessionReportsByLevel['Level 2']],
    [sessionReportsByLevel],
  );

  const activeSessionReports = useMemo(
    () => (selectedLevel ? sessionReportsByLevel[selectedLevel] : allSessionReports),
    [allSessionReports, selectedLevel, sessionReportsByLevel],
  );

  const getOverallStats = () => {
    const totalSessions = activeSessionReports.length;
    const avgAttendance = totalSessions > 0
      ? Math.round(activeSessionReports.reduce((sum, r) => sum + r.attendance, 0) / totalSessions)
      : 0;
    const totalStudents = selectedLevel
      ? knownStudentIdsByLevel[selectedLevel].length
      : new Set(studentSummaries.map((s) => s.studentId)).size;
    return { totalSessions, avgAttendance, totalStudents };
  };

  const stats = getOverallStats();

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <Toaster position="top-right" richColors />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-16">
          <AppNavbar ctaHref="/admin.html#/dashboard" />
        </div>

        <div className="mb-8">
          <PageBackButton 
            onClick={() => {
              if (selectedLevel) {
                setSelectedLevel(null);
                setReportType('sessions');
                return;
              }

              navigate('/dashboard');
            }} 
            label={selectedLevel ? 'Back to Level Selection' : 'Back to Dashboard'} 
          />
        </div>

        {!selectedLevel ? (
          <div className="py-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black mb-4">
              Select Report Level
            </h1>
            <p className="text-slate-600 text-lg max-w-3xl leading-relaxed mb-10">
              Open a dedicated full page for either Level 1 or Level 2 reports.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(['Level 1', 'Level 2'] as AttendanceLevelId[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className="text-left rounded-2xl border border-slate-300 bg-white p-8 hover:border-slate-500 hover:shadow-md transition-all cursor-pointer"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Reports</p>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">{level}</h2>
                  <p className="text-slate-600">
                    {level === 'Level 1' ? 'Morning, Afternoon and Sign-out reports' : 'Afternoon and Sign-out reports'}
                  </p>
                  <div className="mt-6 inline-flex items-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">
                    Proceed
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>

        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black mb-4">
            {selectedLevel} Reports & Analytics
          </h1>
          <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
            Dedicated full-page reports for {selectedLevel} with CSV export.
            <br className="hidden sm:block" />
            Track attendance, volunteer activity, and student progress.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Sessions</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{stats.totalSessions}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600 opacity-60" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-purple-50 to-purple-100/50 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Avg Attendance Rate</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">{stats.avgAttendance}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600 opacity-60" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-green-100/50 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Students</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{stats.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-green-600 opacity-60" />
            </div>
          </div>
        </div>

        {/* Report Type Selection */}
        <div className="mb-10 flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            {(['sessions', 'students', 'volunteers'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize ${
                  reportType === type
                    ? 'bg-black text-white'
                    : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {reportType === 'sessions' ? (
            <p className="ml-auto text-sm font-medium text-slate-600">Use the export button inside each session card.</p>
          ) : (
            <button
              onClick={() => {
                if (reportType === 'students') {
                  exportToCSV(
                    studentSummaries as unknown as Record<string, string | number>[],
                    `student-report-${new Date().toISOString().split('T')[0]}.csv`
                  );
                } else {
                  exportToCSV(
                    volunteerSummaries as unknown as Record<string, string | number>[],
                    `volunteer-report-${new Date().toISOString().split('T')[0]}.csv`
                  );
                }
              }}
              className="ml-auto flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>

        {/* Sessions Report */}
        {reportType === 'sessions' && (
          <div className="space-y-4 mb-12">
            {activeSessionReports.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-dashed border-slate-300 bg-white">
                <BarChart3 className="w-10 h-10 mx-auto mb-3 text-slate-400" />
                <p className="text-slate-600 font-medium">No session data for {selectedLevel}</p>
              </div>
            ) : (
              activeSessionReports.map((report, idx) => (
                <div
                  key={`${selectedLevel}-${idx}`}
                  className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{report.date}</h3>
                      <p className="text-slate-600">{report.session} • Led by {report.volunteer}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{report.attendance}%</p>
                        <p className="text-sm text-slate-600">Attendance Rate</p>
                      </div>
                      <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
                        Export: {selectedLevel} • {report.session}
                      </span>
                      <button
                        onClick={() => {
                          const profile = getProfileForSession(report.session);
                          if (!profile || !selectedLevel) {
                            toast.error('No export profile configured for this session');
                            return;
                          }
                          exportSessionMatrix(profile, { date: report.date, session: report.session, level: selectedLevel });
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                      >
                        <Download className="w-4 h-4" />
                        Export this session
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-xs text-slate-600 uppercase font-semibold tracking-wide">Total Students</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{report.totalStudents}</p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-4">
                      <p className="text-xs text-slate-600 uppercase font-semibold tracking-wide">Present</p>
                      <p className="text-2xl font-bold text-green-900 mt-1">{report.presentStudents}</p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-4">
                      <p className="text-xs text-slate-600 uppercase font-semibold tracking-wide">Absent</p>
                      <p className="text-2xl font-bold text-red-900 mt-1">{report.absentStudents}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Students Report */}
        {reportType === 'students' && (
          <div className="overflow-x-auto mb-12">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Level
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Sessions
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Present
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Absent
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Attendance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Last Session
                  </th>
                </tr>
              </thead>
              <tbody>
                {studentSummaries
                  .filter((student) => selectedLevel ? student.level === selectedLevel : true)
                  .map((student) => (
                  <tr key={student.studentId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{student.name}</p>
                        <p className="text-sm text-slate-600">{student.studentId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{student.level}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-900">{student.totalSessions}</td>
                    <td className="px-6 py-4 text-center font-semibold text-green-700">{student.presentSessions}</td>
                    <td className="px-6 py-4 text-center font-semibold text-red-700">{student.absentSessions}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                        student.attendance >= 90
                          ? 'bg-green-100 text-green-900'
                          : student.attendance >= 80
                          ? 'bg-yellow-100 text-yellow-900'
                          : 'bg-red-100 text-red-900'
                      }`}>
                        {student.attendance}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{student.lastSession}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Volunteers Report */}
        {reportType === 'volunteers' && (
          <div className="overflow-x-auto mb-12">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Volunteer
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Sessions Led
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Students Managed
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    First Session
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Last Session
                  </th>
                </tr>
              </thead>
              <tbody>
                {volunteerSummaries.map((volunteer) => (
                  <tr key={volunteer.volunteerId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{volunteer.name}</p>
                        <p className="text-sm text-slate-600">{volunteer.volunteerId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-900">{volunteer.totalSessions}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-900">{volunteer.totalStudentsManaged}</td>
                    <td className="px-6 py-4 text-slate-700">{volunteer.firstSession}</td>
                    <td className="px-6 py-4 text-slate-700">{volunteer.lastSession}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
