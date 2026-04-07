import { useState } from 'react';
import { useNavigate } from 'react-router';
import { BookOpen, ArrowLeft, Search, Calendar, CheckCircle, XCircle, X, Sun, Moon } from 'lucide-react';

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
  attendanceRecords: AttendanceRecord[];
}

export default function ViewHistory() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Mock student data with attendance history
  const students: Student[] = [
    {
      id: '1',
      studentId: 'STU001',
      name: 'John Doe',
      initials: 'JD',
      attendanceRecords: [
        { date: '2026-04-05', session: 'Saturday Morning', present: true },
        { date: '2026-04-05', session: 'Saturday Afternoon', present: true },
        { date: '2026-03-29', session: 'Saturday Morning', present: false },
        { date: '2026-03-29', session: 'Saturday Afternoon', present: true },
        { date: '2026-03-22', session: 'Saturday Morning', present: true },
      ],
    },
    {
      id: '2',
      studentId: 'STU002',
      name: 'Jane Smith',
      initials: 'JS',
      attendanceRecords: [
        { date: '2026-04-06', session: 'Sunday Afternoon', present: true },
        { date: '2026-04-05', session: 'Saturday Morning', present: true },
        { date: '2026-03-29', session: 'Saturday Morning', present: true },
      ],
    },
    {
      id: '3',
      studentId: 'STU003',
      name: 'Michael Johnson',
      initials: 'MJ',
      attendanceRecords: [
        { date: '2026-04-05', session: 'Saturday Evening', present: true },
        { date: '2026-03-29', session: 'Saturday Evening', present: false },
      ],
    },
  ];

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateAttendanceRate = (records: AttendanceRecord[]) => {
    if (records.length === 0) return 0;
    const presentCount = records.filter((r) => r.present).length;
    return Math.round((presentCount / records.length) * 100);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <header className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-lg sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/volunteer/dashboard')}
                className={`w-10 h-10 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} flex items-center justify-center transition-colors`}
              >
                <ArrowLeft className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`} />
              </button>
              <div>
                <h1 className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontWeight: '700', fontSize: '1.25rem' }}>
                  Attendance History
                </h1>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontSize: '0.75rem' }}>
                  View student attendance records
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-10 h-10 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} flex items-center justify-center transition-colors`}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-gray-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>
              <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-4 border-2 ${isDarkMode ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-200 bg-white text-gray-900 placeholder-gray-500'} rounded-xl focus:border-gray-800 focus:outline-none transition-colors`}
              placeholder="Search by name or student ID..."
            />
          </div>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => {
            const rate = calculateAttendanceRate(student.attendanceRecords);
            return (
              <div
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'} border-2 rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all duration-300`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gray-700 flex items-center justify-center text-white mb-4 shadow-lg" style={{ fontWeight: '700', fontSize: '1.5rem' }}>
                    {student.initials}
                  </div>
                  <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`} style={{ fontWeight: '700', fontSize: '1.125rem' }}>
                    {student.name}
                  </h4>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`} style={{ fontSize: '0.875rem' }}>
                    ID: {student.studentId}
                  </p>

                  <div className="w-full space-y-2">
                    <div
                      className={`w-full px-4 py-2 rounded-xl ${
                        rate >= 80
                          ? isDarkMode ? 'bg-gray-700 text-gray-300 border-2 border-gray-600' : 'bg-gray-100 text-gray-700'
                          : rate >= 50
                          ? isDarkMode ? 'bg-gray-700 text-gray-300 border-2 border-gray-600' : 'bg-gray-100 text-gray-700'
                          : isDarkMode ? 'bg-gray-700 text-gray-300 border-2 border-gray-600' : 'bg-gray-100 text-gray-700'
                      }`}
                      style={{ fontSize: '1.25rem', fontWeight: '700' }}
                    >
                      {rate}%
                    </div>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontSize: '0.875rem' }}>
                      {student.attendanceRecords.filter(r => r.present).length} / {student.attendanceRecords.length} sessions
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedStudent(null)}
        >
          <div className="relative">
            {/* Close Button - Standalone */}
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors shadow-xl z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <div
              className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border-2`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-black p-6 rounded-t-2xl relative">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-black shadow-lg" style={{ fontWeight: '700', fontSize: '2rem' }}>
                    {selectedStudent.initials}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white mb-1" style={{ fontWeight: '700', fontSize: '1.75rem' }}>
                      {selectedStudent.name}
                    </h3>
                    <p className="text-gray-300" style={{ fontSize: '1rem' }}>
                      ID: {selectedStudent.studentId}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`px-4 py-2 rounded-xl bg-white shadow-lg ${
                        calculateAttendanceRate(selectedStudent.attendanceRecords) >= 80
                          ? 'text-gray-700'
                          : calculateAttendanceRate(selectedStudent.attendanceRecords) >= 50
                          ? 'text-gray-700'
                          : 'text-gray-700'
                      }`}
                      style={{ fontSize: '1.5rem', fontWeight: '700' }}
                    >
                      {calculateAttendanceRate(selectedStudent.attendanceRecords)}%
                    </div>
                    <p className="text-gray-300 mt-1" style={{ fontSize: '0.75rem' }}>
                      Attendance Rate
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              {/* Instruction hint */}
              <div className={`mb-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} style={{ fontSize: '0.75rem' }}>
                Click outside or the red button to close
              </div>

              <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`} style={{ fontWeight: '700', fontSize: '1.25rem' }}>
                <Calendar className="w-5 h-5 text-gray-700" />
                Attendance History ({selectedStudent.attendanceRecords.length} sessions)
              </h3>

              <div className="space-y-3">
                {selectedStudent.attendanceRecords.map((record, index) => (
                  <div
                    key={index}
                    className={`border-2 rounded-xl p-4 ${
                      record.present
                        ? isDarkMode ? 'bg-green-900 bg-opacity-30 border-green-500' : 'border-green-200 bg-green-50'
                        : isDarkMode ? 'bg-red-900 bg-opacity-30 border-red-500' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${record.present ? 'bg-green-500' : 'bg-red-500'}`}>
                          {record.present ? (
                            <CheckCircle className="w-6 h-6 text-white" />
                          ) : (
                            <XCircle className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`} style={{ fontWeight: '600', fontSize: '1rem' }}>
                            {record.session}
                          </h4>
                          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontSize: '0.875rem' }}>
                            {new Date(record.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`px-4 py-2 rounded-xl ${
                          record.present
                            ? isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                            : isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                        }`}
                        style={{ fontWeight: '600', fontSize: '0.875rem' }}
                      >
                        {record.present ? 'Present' : 'Absent'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
