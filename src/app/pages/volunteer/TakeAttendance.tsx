import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { BookOpen, ArrowLeft, User, CheckCircle, Calendar, Clock, QrCode, TrendingUp, X, Mail, Phone, Sun, Moon, Search } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const THEME_STORAGE_KEY = 'volunteer-theme';

interface Student {
  id: string;
  name: string;
  studentId: string;
  initials: string;
}

interface CheckedInStudent extends Student {
  checkInTime: string;
  sessionName: string;
  animation: boolean;
}

export default function TakeAttendance() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = location.state?.session || { name: 'Morning', time: '9:00 AM - 11:30 AM' };
  const selectedLevel = location.state?.level || 'Level 1';

  const [idInput, setIdInput] = useState('');
  const [checkedInStudents, setCheckedInStudents] = useState<CheckedInStudent[]>([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [countdownTime, setCountdownTime] = useState(7200); // 2 hours in seconds
  const [selectedStudent, setSelectedStudent] = useState<CheckedInStudent | null>(null);
  const [studentDataCache, setStudentDataCache] = useState<Record<string, any>>({});
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme ? savedTheme === 'dark' : true;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmStudent, setConfirmStudent] = useState<Student | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate random attendance history (memoized per student)
  const generateAttendanceHistory = (studentId: string) => {
    if (studentDataCache[studentId]) {
      return studentDataCache[studentId];
    }

    const sessions = ['Morning', 'Afternoon', 'Evening'];
    const dates = [
      'Apr 6, 2026',
      'Apr 5, 2026',
      'Apr 4, 2026',
      'Apr 3, 2026',
      'Apr 2, 2026',
    ];

    const data = {
      phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      history: dates.map((date) => ({
        date,
        session: sessions[Math.floor(Math.random() * sessions.length)],
        status: Math.random() > 0.2 ? 'present' : 'absent',
        time: Math.random() > 0.5 ? '9:15 AM' : '1:45 PM',
      })),
    };

    setStudentDataCache((prev) => ({ ...prev, [studentId]: data }));
    return data;
  };

  // Student lookup database — will be populated from the real database
  const allStudents: Student[] = [];

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdownTime <= 0) return;

    const interval = setInterval(() => {
      setCountdownTime((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdownTime]);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();

    const studentIdUpper = idInput.toUpperCase().trim();

    if (!studentIdUpper) {
      toast.error('Please enter a student ID');
      return;
    }

    // Find student
    const student = allStudents.find(
      (s) => s.studentId.toUpperCase() === studentIdUpper
    );

    if (!student) {
      toast.error(`Student ID "${idInput}" not found`);
      setIdInput('');
      return;
    }

    // Check if already checked in
    if (checkedInStudents.find((s) => s.studentId === student.studentId)) {
      toast.error(`${student.name} is already checked in`);
      setIdInput('');
      return;
    }

    // Add to checked-in list with animation
    const checkedInStudent: CheckedInStudent = {
      ...student,
      checkInTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      sessionName: session.name,
      animation: true,
    };

    setCheckedInStudents([checkedInStudent, ...checkedInStudents]);
    toast.success(`✓ ${student.name} checked in successfully!`);
    setIdInput('');

    // Remove animation flag after animation completes
    setTimeout(() => {
      setCheckedInStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, animation: false } : s))
      );
    }, 500);

    // Success feedback
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleQuickCheckIn = (student: Student) => {
    // Check if already checked in
    if (checkedInStudents.find((s) => s.studentId === student.studentId)) {
      toast.error(`${student.name} is already checked in`);
      return;
    }

    // Add to checked-in list
    const checkedInStudent: CheckedInStudent = {
      ...student,
      checkInTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      sessionName: session.name,
      animation: true,
    };

    setCheckedInStudents([checkedInStudent, ...checkedInStudents]);
    toast.success(`✓ ${student.name} checked in successfully!`);
    setSearchQuery('');
    setConfirmStudent(null);

    // Remove animation flag after animation completes
    setTimeout(() => {
      setCheckedInStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, animation: false } : s))
      );
    }, 500);

    // Refocus scanner input
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Filter students based on search query
  const filteredStudents = searchQuery
    ? allStudents.filter((student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className={`h-screen overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <Toaster position="top-right" richColors />
      {/* Header */}
      <header className={`border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-lg`}>
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
                  Attendance Scanning
                </h1>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontSize: '0.75rem' }}>Monday, April 7, 2026</p>
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
              <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} px-3 py-1 rounded-full flex items-center gap-2`}>
                <User className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`} />
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontSize: '0.75rem', fontWeight: '600' }}>Active Today</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                <span className="text-white" style={{ fontWeight: '700' }}>0</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-89px)] overflow-hidden flex flex-col">
        <div className="grid lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Left Column - Scanner */}
          <div className="lg:col-span-2 flex flex-col gap-6 min-h-0 flex-[3.5]">
            {/* Session Card */}
            <div className="bg-black rounded-2xl p-4 flex items-center justify-between shadow-lg flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white" style={{ fontWeight: '700', fontSize: '1.125rem' }}>
                    {session.name} Session - {selectedLevel}
                  </h3>
                  <p className="text-gray-400" style={{ fontSize: '0.875rem' }}>{session.time}</p>
                </div>
              </div>
            </div>

            {/* Scanner Card */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-2xl p-6 shadow-lg flex-1 min-h-0 flex flex-col`}>
              {/* QR Code Icon */}
              <div className="flex-1 flex flex-col items-center justify-center mb-8">
                <div className={`w-64 h-64 border-4 border-gray-300 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <QrCode className={`w-40 h-40 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </div>

                <h3 className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-8 mb-2`} style={{ fontWeight: '700', fontSize: '1.5rem' }}>
                  Scan Student ID
                </h3>
                <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontSize: '1rem' }}>
                  Enter or scan a student ID card to log attendance
                </p>
              </div>

              <form onSubmit={handleCheckIn} className="space-y-4 flex-shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={idInput}
                  onChange={(e) => {
                    setIdInput(e.target.value);
                  }}
                  className={`w-full px-6 py-5 border-2 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'} rounded-xl focus:border-gray-800 focus:outline-none transition-colors text-center`}
                  placeholder="Enter Student ID or scan card..."
                  autoFocus
                  style={{ fontSize: '1.125rem' }}
                />

                <button
                  type="submit"
                  className={`w-full py-5 px-6 rounded-xl font-semibold transition-colors ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-black text-white hover:bg-gray-900'}`}
                  style={{ fontSize: '1.125rem', fontWeight: '600' }}
                >
                  Log Attendance
                </button>
              </form>

              {/* Timer */}
              <div className={`mt-8 pt-8 border-t-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between flex-shrink-0`}>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                    {formatTime(countdownTime)}
                  </span>
                </div>
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontSize: '0.875rem' }}>
                  Until Next Session
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Check-ins */}
          <div className="lg:col-span-1 flex flex-col gap-6 min-h-0 flex-[2]">
            {/* Stats Box */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-2xl p-4 shadow-lg`}>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`} style={{ fontSize: '0.7rem' }}>Present</p>
                  <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                    {checkedInStudents.length}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-lg bg-gray-400 flex items-center justify-center mx-auto mb-2">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`} style={{ fontSize: '0.7rem' }}>Absent</p>
                  <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                    {allStudents.length - checkedInStudents.length}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`} style={{ fontSize: '0.7rem' }}>Rate</p>
                  <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                    {allStudents.length > 0 ? Math.round((checkedInStudents.length / allStudents.length) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-2xl p-6 shadow-lg flex-1 min-h-0 flex flex-col`}>
              <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`} style={{ fontWeight: '700', fontSize: '1.125rem' }}>
                <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`} />
                Recent Check-ins
              </h3>

              {checkedInStudents.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div>
                    <div className={`w-16 h-16 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mx-auto mb-4`}>
                      <User className={`w-8 h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    </div>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontSize: '0.875rem' }}>
                      No scans yet,<br />start scanning to see<br />check-ins appear here
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {checkedInStudents.map((student, index) => (
                    <button
                      key={student.id}
                      onClick={() => {
                        setSelectedStudent(student);
                      }}
                      className={`w-full border-2 rounded-xl p-3 transition-colors cursor-pointer ${
                        index === 0
                          ? isDarkMode
                            ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                            : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                          : isDarkMode
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-white" style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                          {student.initials}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`} style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                            {student.name}
                          </h4>
                          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} truncate`} style={{ fontSize: '0.75rem', fontWeight: '600' }}>
                            Student ID: {student.studentId}
                          </p>
                          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontSize: '0.75rem' }}>
                            Checked in at {student.checkInTime}
                          </p>
                        </div>
                        {index === 0 && (
                          <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} flex-shrink-0`} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Student Search Section */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-2xl p-6 shadow-lg flex-1 min-h-0 flex flex-col`}>
              <div className="flex items-center gap-2 mb-4">
                <Search className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`} />
                <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontWeight: '700', fontSize: '1.125rem' }}>
                  Quick Student Lookup
                </h3>
              </div>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`} style={{ fontSize: '0.875rem' }}>
                Search by name or ID for students without their card
              </p>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-4 py-3 border-2 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'} rounded-xl focus:border-gray-800 focus:outline-none transition-colors`}
                placeholder="Search by name or ID..."
                style={{ fontSize: '1rem' }}
              />

              {/* Search Results */}
              {searchQuery ? (
                <div className="mt-4 space-y-2 flex-1 overflow-y-auto pr-1">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => {
                      const alreadyCheckedIn = checkedInStudents.find((s) => s.studentId === student.studentId);
                      return (
                        <button
                          key={student.id}
                          onClick={() => !alreadyCheckedIn && setConfirmStudent(student)}
                          disabled={!!alreadyCheckedIn}
                          className={`w-full border-2 rounded-xl p-3 transition-colors text-left ${
                            alreadyCheckedIn
                              ? isDarkMode
                                ? 'bg-gray-700 border-gray-600 opacity-50 cursor-not-allowed'
                                : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                              : isDarkMode
                              ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 cursor-pointer'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-white flex-shrink-0`} style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                              {student.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`} style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                                {student.name}
                              </h4>
                              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontSize: '0.75rem' }}>
                                ID: {student.studentId}
                              </p>
                            </div>
                            {alreadyCheckedIn && (
                              <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} flex-shrink-0`} />
                            )}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontSize: '0.875rem' }}>
                      No students found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div>
                    <div className={`w-16 h-16 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mx-auto mb-4`}>
                      <Search className={`w-8 h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    </div>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontSize: '0.875rem' }}>
                      Type a name or ID<br />to search
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2`}>
            {/* Modal Header */}
            <div className="bg-black p-6 rounded-t-2xl relative">
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-black shadow-lg" style={{ fontWeight: '700', fontSize: '1.5rem' }}>
                  {selectedStudent.initials}
                </div>
                <div>
                  <h3 className="text-white mb-1" style={{ fontWeight: '700', fontSize: '1.5rem' }}>
                    {selectedStudent.name}
                  </h3>
                  <p className="text-gray-200" style={{ fontSize: '0.875rem' }}>
                    ID: {selectedStudent.studentId}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Student Info */}
              <div>
                <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`} style={{ fontWeight: '700', fontSize: '1rem' }}>
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Mail className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`} />
                    <span style={{ fontSize: '0.875rem' }}>
                      {selectedStudent.studentId.toLowerCase()}@bibleschool.edu
                    </span>
                  </div>
                  <div className={`flex items-center gap-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Phone className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`} />
                    <span style={{ fontSize: '0.875rem' }}>
                      {generateAttendanceHistory(selectedStudent.studentId).phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Check-in */}
              <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} border-2 rounded-xl p-4`}>
                <h4 className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 flex items-center gap-2`} style={{ fontWeight: '700', fontSize: '0.875rem' }}>
                  <CheckCircle className="w-4 h-4" />
                  Current Check-in
                </h4>
                <div className="space-y-1">
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`} style={{ fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: '600' }}>Session:</span> {selectedStudent.sessionName}
                  </p>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`} style={{ fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: '600' }}>Time:</span> {selectedStudent.checkInTime}
                  </p>
                </div>
              </div>

              {/* Attendance History */}
              <div>
                <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`} style={{ fontWeight: '700', fontSize: '1rem' }}>
                  Recent Attendance
                </h4>
                <div className="space-y-2">
                  {generateAttendanceHistory(selectedStudent.studentId).history.map((record: any, index: number) => (
                    <div
                      key={index}
                      className={`p-3 rounded-xl border-2 ${
                        record.status === 'present'
                          ? isDarkMode
                            ? 'bg-gray-700 border-gray-600'
                            : 'bg-gray-100 border-gray-300'
                          : isDarkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                            {record.date}
                          </p>
                          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontSize: '0.75rem' }}>
                            {record.session} Session
                          </p>
                        </div>
                        <div className="text-right">
                          {record.status === 'present' ? (
                            <>
                              <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} ml-auto mb-1`} />
                              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontSize: '0.75rem', fontWeight: '600' }}>
                                {record.time}
                              </p>
                            </>
                          ) : (
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontSize: '0.75rem', fontWeight: '600' }}>
                              Absent
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attendance Stats */}
              <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} border-2 rounded-xl p-4`}>
                <h4 className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`} style={{ fontWeight: '700', fontSize: '0.875rem' }}>
                  Attendance Summary
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`} style={{ fontSize: '0.75rem' }}>
                      Present
                    </p>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                      {generateAttendanceHistory(selectedStudent.studentId).history.filter((r: any) => r.status === 'present').length}
                    </p>
                  </div>
                  <div>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`} style={{ fontSize: '0.75rem' }}>
                      Rate
                    </p>
                    <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                      {Math.round((generateAttendanceHistory(selectedStudent.studentId).history.filter((r: any) => r.status === 'present').length / 5) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl max-w-sm w-full border-2`}>
            {/* Modal Header */}
            <div className="bg-black p-6 rounded-t-2xl relative">
              <button
                onClick={() => setConfirmStudent(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-black shadow-lg mx-auto mb-4" style={{ fontWeight: '700', fontSize: '2rem' }}>
                  {confirmStudent.initials}
                </div>
                <h3 className="text-white mb-1" style={{ fontWeight: '700', fontSize: '1.5rem' }}>
                  {confirmStudent.name}
                </h3>
                <p className="text-purple-200" style={{ fontSize: '0.875rem' }}>
                  ID: {confirmStudent.studentId}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`} style={{ fontSize: '1rem' }}>
                Confirm check-in for this student?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmStudent(null)}
                  className={`flex-1 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} py-3 px-4 rounded-xl transition-colors`}
                  style={{ fontWeight: '600', fontSize: '1rem' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleQuickCheckIn(confirmStudent)}
                  className="flex-1 bg-black hover:bg-gray-900 text-white py-3 px-4 rounded-xl transition-colors"
                  style={{ fontWeight: '600', fontSize: '1rem' }}
                >
                  Confirm Check-in
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsDarkMode((prev) => !prev)}
        className={`fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full px-4 py-3 shadow-xl transition-colors ${
          isDarkMode ? 'bg-gray-800 text-gray-100 hover:bg-gray-700 border border-gray-600' : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-200'
        }`}
      >
        {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Theme: {isDarkMode ? 'Dark' : 'Light'}</span>
      </button>
    </div>
  );
}
