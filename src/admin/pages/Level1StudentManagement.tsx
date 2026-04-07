import { useMemo, useState } from 'react';
import { ArrowLeft, Calendar, Search, Users, X } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import AppNavbar from '../../components/AppNavbar';

interface Student {
  id: number;
  studentId: string;
  name: string;
  campus: 'Lagos Island' | 'Lagos Mainland';
  level: 'Level 1' | 'Level 2';
  email: string;
  enrollmentDate: string;
}

interface AttendanceRecord {
  date: string;
  session: string;
  status: 'present' | 'absent';
  volunteer: string;
}

export default function Level1StudentManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [students, setStudents] = useState<Student[]>([
    { id: 1, studentId: 'STU001', name: 'Adeyemi Okafor', campus: 'Lagos Island', level: 'Level 1', email: 'adeyemi@bibleschool.edu', enrollmentDate: 'Jan 15, 2026' },
    { id: 2, studentId: 'STU002', name: 'Chioma Nwosu', campus: 'Lagos Mainland', level: 'Level 1', email: 'chioma@bibleschool.edu', enrollmentDate: 'Jan 20, 2026' },
    { id: 3, studentId: 'STU003', name: 'David Akin', campus: 'Lagos Island', level: 'Level 1', email: 'david@bibleschool.edu', enrollmentDate: 'Feb 1, 2026' },
    { id: 4, studentId: 'STU004', name: 'Grace Nnaji', campus: 'Lagos Mainland', level: 'Level 1', email: 'grace@bibleschool.edu', enrollmentDate: 'Feb 5, 2026' },
    { id: 5, studentId: 'STU005', name: 'Moses Daniel', campus: 'Lagos Island', level: 'Level 1', email: 'moses@bibleschool.edu', enrollmentDate: 'Feb 10, 2026' },
    { id: 6, studentId: 'STU006', name: 'Ruth Peter', campus: 'Lagos Mainland', level: 'Level 1', email: 'ruth@bibleschool.edu', enrollmentDate: 'Feb 15, 2026' },
    { id: 7, studentId: 'STU007', name: 'Samuel Okafor', campus: 'Lagos Island', level: 'Level 1', email: 'samuel@bibleschool.edu', enrollmentDate: 'Mar 1, 2026' },
    { id: 8, studentId: 'STU008', name: 'Tunde Lawal', campus: 'Lagos Mainland', level: 'Level 1', email: 'tunde@bibleschool.edu', enrollmentDate: 'Mar 5, 2026' },
  ]);

  // Sample attendance data for each student
  const getAttendanceHistory = (studentId: string): AttendanceRecord[] => {
    const baseData: Record<string, AttendanceRecord[]> = {
      'STU001': [
        { date: 'Apr 6, 2026', session: 'Morning Session', status: 'present', volunteer: 'Adebayo Lawal' },
        { date: 'Mar 30, 2026', session: 'Morning Session', status: 'present', volunteer: 'Grace Nnaji' },
        { date: 'Mar 23, 2026', session: 'Morning Session', status: 'absent', volunteer: 'David Akin' },
        { date: 'Mar 16, 2026', session: 'Morning Session', status: 'present', volunteer: 'Ruth Okafor' },
        { date: 'Mar 9, 2026', session: 'Morning Session', status: 'present', volunteer: 'Moses Daniel' },
      ],
      'STU002': [
        { date: 'Apr 6, 2026', session: 'Morning Session', status: 'present', volunteer: 'Grace Nnaji' },
        { date: 'Mar 30, 2026', session: 'Morning Session', status: 'absent', volunteer: 'Adebayo Lawal' },
        { date: 'Mar 23, 2026', session: 'Morning Session', status: 'present', volunteer: 'David Akin' },
        { date: 'Mar 16, 2026', session: 'Morning Session', status: 'present', volunteer: 'Ruth Okafor' },
      ],
      'STU003': [
        { date: 'Apr 6, 2026', session: 'Morning Session', status: 'absent', volunteer: 'David Akin' },
        { date: 'Mar 30, 2026', session: 'Morning Session', status: 'present', volunteer: 'Grace Nnaji' },
        { date: 'Mar 23, 2026', session: 'Morning Session', status: 'absent', volunteer: 'Adebayo Lawal' },
      ],
      'STU004': [
        { date: 'Apr 6, 2026', session: 'Morning Session', status: 'present', volunteer: 'Ruth Okafor' },
        { date: 'Mar 30, 2026', session: 'Morning Session', status: 'present', volunteer: 'Moses Daniel' },
        { date: 'Mar 23, 2026', session: 'Morning Session', status: 'present', volunteer: 'Grace Nnaji' },
        { date: 'Mar 16, 2026', session: 'Morning Session', status: 'absent', volunteer: 'David Akin' },
        { date: 'Mar 9, 2026', session: 'Morning Session', status: 'present', volunteer: 'Adebayo Lawal' },
      ],
    };
    return baseData[studentId] || [];
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSearch;
    });
  }, [students, searchQuery]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAttendanceStats = (studentId: string) => {
    const history = getAttendanceHistory(studentId);
    const present = history.filter(h => h.status === 'present').length;
    const total = history.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, total, rate };
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <Toaster position="top-right" richColors />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-16">
          <AppNavbar ctaHref="/admin#/dashboard" />
        </div>

        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black mb-4">
            Level 1: Attendance Records
          </h1>
          <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
            View and manage attendance records for Level 1 students. Click on any student
            <br className="hidden sm:block" />
            to see their detailed attendance history and session participation.
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-10">
          <input
            type="text"
            placeholder="Search students by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 px-6 rounded-2xl border border-slate-300 bg-white text-center text-lg font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
          />
        </div>

        {/* Students Attendance Records */}
        <div className="space-y-3 mb-12">
          {filteredStudents.map((student) => {
            const attendanceStats = getAttendanceStats(student.studentId);
            return (
              <div
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="grid grid-cols-[56px_1fr_auto_auto] sm:grid-cols-[72px_minmax(200px,1fr)_120px_120px] items-center gap-4 sm:gap-6 bg-white border border-slate-200 rounded-2xl px-4 sm:px-8 py-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black flex items-center justify-center text-white font-bold text-xs">
                  {getInitials(student.name)}
                </div>

                <div className="min-w-0">
                  <p className="text-lg font-semibold text-black leading-tight">{student.name}</p>
                  <p className="text-sm text-slate-600">{student.studentId} • {student.campus}</p>
                </div>

                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">{attendanceStats.rate}%</p>
                  <p className="text-xs text-slate-500">Attendance Rate</p>
                </div>

                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">{attendanceStats.present}</p>
                  <p className="text-xs text-slate-500">of {attendanceStats.total} sessions</p>
                </div>
              </div>
            );
          })}

          {filteredStudents.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200">
              <Users className="w-8 h-8 mx-auto mb-3 text-slate-400" />
              <p className="text-slate-600 font-medium">No student records found.</p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center pb-12">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-lg bg-black hover:bg-gray-900 text-white px-6 py-3 text-sm font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      {/* Attendance History Modal */}
      {selectedStudent && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-black p-6 rounded-t-2xl relative">
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-black text-lg font-bold">
                  {getInitials(selectedStudent.name)}
                </div>
                <div>
                  <h2 className="text-white mb-1" style={{ fontWeight: '700', fontSize: '1.25rem' }}>
                    {selectedStudent.name}
                  </h2>
                  <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest">{selectedStudent.studentId}</p>
                  <p className="text-slate-400 text-sm">{selectedStudent.campus}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-slate-700" />
                <h3 className="text-lg font-bold text-slate-900">Attendance History</h3>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getAttendanceHistory(selectedStudent.studentId).map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${record.status === 'present' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="font-semibold text-slate-900">{record.date}</p>
                        <p className="text-sm text-slate-600">{record.session} • {record.volunteer}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      record.status === 'present'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                ))}

                {getAttendanceHistory(selectedStudent.studentId).length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-60" />
                    <p>No attendance records found.</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Overall Attendance</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {getAttendanceStats(selectedStudent.studentId).rate}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">Sessions Attended</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {getAttendanceStats(selectedStudent.studentId).present} / {getAttendanceStats(selectedStudent.studentId).total}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
