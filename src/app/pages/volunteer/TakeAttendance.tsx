import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, Clock, QrCode, TrendingUp, Search, CheckCircle, User, X, Lock, AlertCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import {
  ATTENDANCE_LEVELS,
  ATTENDANCE_LEVEL_MAP,
  isSessionActive,
  getSessionTimeRemaining,
  type AttendanceDayConfig,
  type AttendanceDayId,
  type DayOfWeek,
  type AttendanceLevelConfig,
  type AttendanceLevelId,
  type AttendanceSession,
  type AttendanceStudent,
} from './attendanceConfig';
import { approvalService } from '../../../features/approvals/approvalService';
import { attendanceService } from '../../../features/attendance/attendanceService';
import { useAuth } from '../../../features/auth/AuthProvider';
import { sessionService } from '../../../features/sessions/sessionService';

type Step = 'level' | 'day' | 'session' | 'scanner';

type Student = AttendanceStudent;

interface CheckedInStudent extends Student {
  checkInTime: string;
  sessionName: string;
}

function BrandHeader({ onBack, navigate }: { onBack: () => void; navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10">
      <div className="rounded-xl border border-slate-300 bg-[#f2f2f5] px-5 py-2.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="rounded-full border border-slate-300 bg-white p-2 text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer" aria-label="Go back">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/volunteer/dashboard')} className="hidden sm:grid h-12 w-12 place-items-center rounded-full bg-slate-200 text-xl font-black text-black">
              SP
            </button>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-900">
            <span>Add new student</span>
            <span>ID Collection</span>
            <span>Volunteer Sign up</span>
            <span>Knowledge Based</span>
            <span>RHEMA Website</span>
          </div>
          <button className="rounded-md bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors">Get started</button>
        </div>
      </div>
    </div>
  );
}

function LevelSelectionCard({ level, onSelect }: { level: AttendanceLevelConfig; onSelect: (levelId: AttendanceLevelId) => void }) {
  return (
    <button
      onClick={() => onSelect(level.id)}
      className="group relative w-full overflow-hidden rounded-xl border border-slate-300 bg-[#f2f2f5] px-8 py-8 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-400 cursor-pointer"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-slate-200" />
      <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-slate-300 bg-white px-3 py-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{level.shortLabel}</span>
        <div className={level.cardVariant === 'editorial' ? 'h-3 w-3 rounded-sm bg-slate-300' : 'h-3 w-3 rounded-full bg-slate-300'} />
      </div>
      <div className={level.cardVariant === 'editorial' ? 'mx-auto mt-8 h-20 w-20 rounded-3xl bg-slate-200' : 'mx-auto mt-8 h-20 w-20 rounded-full bg-slate-300'} />
      <h2 className="mt-6 text-3xl font-black text-black">{level.cardTitle}</h2>
      <p className="mt-3 text-base md:text-lg font-medium text-slate-800">{level.cardDescription[0]}</p>
      <p className="text-base md:text-lg font-medium text-slate-800">{level.cardDescription[1]}</p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Proceed</span>
        <div className="grid h-11 w-11 place-items-center rounded-full bg-black text-white transition-transform group-hover:translate-x-0.5">
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
    </button>
  );
}

function SessionSelectionCard({
  day,
  session,
  onSelect,
}: {
  day: AttendanceDayConfig;
  session: AttendanceSession;
  onSelect: (sessionName: string) => void;
}) {
  if (day.sessionVariant === 'feature') {
    return (
      <button
        onClick={() => onSelect(session.name)}
        className="group w-full rounded-xl border border-slate-300 bg-[#f2f2f5] p-8 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-400 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="inline-flex rounded-md border border-slate-300 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Focus Block
            </div>
            <h2 className="mt-5 text-3xl font-black text-black">{session.name}</h2>
            <p className="mt-2 text-base font-medium text-slate-700">{session.time}</p>
            <p className="mt-5 max-w-md text-sm font-medium leading-6 text-slate-600">{session.description}</p>
          </div>
          <div className="h-16 w-16 rounded-2xl bg-slate-200" />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Open attendance</span>
          <div className="grid h-11 w-11 place-items-center rounded-full bg-black text-white transition-transform group-hover:translate-x-0.5">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => onSelect(session.name)}
      className="group w-full rounded-xl border border-slate-300 bg-[#f2f2f5] p-8 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-400 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="inline-flex rounded-md border border-slate-300 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Session
          </div>
          <h2 className="mt-5 text-3xl font-black text-black">{session.name}</h2>
          <p className="mt-2 text-base font-medium text-slate-700">{session.time}</p>
          <p className="mt-5 max-w-xs text-sm font-medium leading-6 text-slate-600">{session.description}</p>
        </div>
        <div className="h-14 w-14 rounded-full bg-slate-200" />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Proceed</span>
        <div className="grid h-11 w-11 place-items-center rounded-full bg-black text-white transition-transform group-hover:translate-x-0.5">
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
    </button>
  );
}

export default function TakeAttendance() {
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (!session || session.role !== 'volunteer') {
      navigate('/volunteer');
    }
  }, [navigate, session]);
  const initialLevel = (() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const levelFromUrl = new URLSearchParams(window.location.search).get('level');
    return levelFromUrl === 'Level 1' || levelFromUrl === 'Level 2' ? levelFromUrl : null;
  })();
  const [currentStep, setCurrentStep] = useState<Step>('level');
  const [selectedLevel, setSelectedLevel] = useState<AttendanceLevelId | null>(initialLevel);
  const [selectedDay, setSelectedDay] = useState<AttendanceDayId | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [idInput, setIdInput] = useState('');
  const [checkedInStudents, setCheckedInStudents] = useState<CheckedInStudent[]>([]);
  const [countdownTime, setCountdownTime] = useState(0); // Will be set based on session time remaining
  const [searchQuery, setSearchQuery] = useState('');
  const [unknownStudentModalOpen, setUnknownStudentModalOpen] = useState(false);
  const [unknownStudentModalStep, setUnknownStudentModalStep] = useState<'confirm' | 'form'>('confirm');
  const [unknownStudentId, setUnknownStudentId] = useState('');
  const [unknownStudentName, setUnknownStudentName] = useState('');
  const [unknownStudentCampus, setUnknownStudentCampus] = useState<'Lagos Island' | 'Lagos Mainland'>('Lagos Island');
  const [submittingUnknownStudent, setSubmittingUnknownStudent] = useState(false);
  const [quickLookupCandidate, setQuickLookupCandidate] = useState<Student | null>(null);
  const [isSessionTimeLocked, setIsSessionTimeLocked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedLevelConfig = selectedLevel ? ATTENDANCE_LEVEL_MAP[selectedLevel] : null;
  const selectedDayConfig = selectedLevelConfig?.days.find((day) => day.id === selectedDay) ?? null;
  const todayWeekday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as DayOfWeek | string;
  const todayAttendanceDay = selectedLevelConfig?.days.find((day) => day.dayOfWeek === todayWeekday) ?? null;
  const allStudents: Student[] = selectedLevelConfig ? selectedLevelConfig.getStudents() : [];
  const studentsByLevel = useMemo(
    () => ({
      'Level 1': ATTENDANCE_LEVEL_MAP['Level 1'].getStudents(),
      'Level 2': ATTENDANCE_LEVEL_MAP['Level 2'].getStudents(),
    }),
    [],
  );

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) {
      return [];
    }

    const lowerQuery = query.toLowerCase();

    const ranked = allStudents
      .map((student) => {
        const studentId = student.studentId.toLowerCase();
        const name = student.name.toLowerCase();

        let rank = -1;
        if (studentId.startsWith(lowerQuery)) {
          rank = 0;
        } else if (studentId.includes(lowerQuery)) {
          rank = 1;
        } else if (name.startsWith(lowerQuery)) {
          rank = 2;
        } else if (name.includes(lowerQuery)) {
          rank = 3;
        }

        return { student, rank };
      })
      .filter((item) => item.rank !== -1)
      .sort((a, b) => {
        if (a.rank !== b.rank) {
          return a.rank - b.rank;
        }
        return a.student.studentId.localeCompare(b.student.studentId, undefined, { numeric: true, sensitivity: 'base' });
      })
      .slice(0, 4)
      .map((item) => item.student);

    return ranked;
  }, [allStudents, searchQuery]);

  const selectedSessionLabel = useMemo(
    () => [selectedDay, selectedSession].filter(Boolean).join(' - ') || 'Session',
    [selectedDay, selectedSession],
  );

  useEffect(() => {
    if (currentStep === 'scanner') inputRef.current?.focus();
  }, [currentStep]);

  useEffect(() => {
    if (countdownTime <= 0 || currentStep !== 'scanner') return;
    
    const interval = setInterval(() => {
      setCountdownTime((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setIsSessionTimeLocked(true);
          toast.error('❌ Session time has ended. Scanner is now closed.');
        }
        return Math.max(0, newTime);
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [countdownTime, currentStep]);

  useEffect(() => {
    if (initialLevel) {
      setCurrentStep('day');
    }
  }, [initialLevel]);

  useEffect(() => {
    if (currentStep !== 'day' || !todayAttendanceDay) {
      return;
    }

    setSelectedDay(todayAttendanceDay.id);
    setSelectedSession(null);
    setCheckedInStudents([]);
    setCurrentStep('session');
  }, [currentStep, todayAttendanceDay]);

  useEffect(() => {
    if (currentStep !== 'scanner' || !selectedSessionLabel) {
      return;
    }

    const hydrateCheckedInStudents = async () => {
      const records = await attendanceService.listAttendanceRecords();
      const currentSessionStudents = records
        .filter((record) => record.session === selectedSessionLabel && record.status === 'present')
        .map((record) => allStudents.find((student) => student.studentId === record.studentId))
        .filter((student): student is Student => Boolean(student))
        .map((student) => ({
          ...student,
          checkInTime: 'Live',
          sessionName: selectedSessionLabel,
        }));

      setCheckedInStudents(currentSessionStudents);
    };

    void hydrateCheckedInStudents();
    const unsub = attendanceService.subscribe(() => {
      void hydrateCheckedInStudents();
    });

    // Polling fallback: sync checked-in list every 10s
    const poll = setInterval(() => void hydrateCheckedInStudents(), 10000);

    return () => {
      unsub();
      clearInterval(poll);
    };
  }, [allStudents, currentStep, selectedSessionLabel]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleLevelSelect = (level: AttendanceLevelId) => {
    if (typeof window !== 'undefined') {
      const nextUrl = `${window.location.pathname}?level=${encodeURIComponent(level)}`;
      window.open(nextUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSessionSelect = (session: string) => {
    // Find the session object to check if it's within active time window
    const sessionObj = selectedDayConfig?.sessions.find(s => s.name === session);
    if (sessionObj && !isSessionActive(sessionObj)) {
      toast.error(`❌ Session not active. ${sessionObj.time}`);
      setIsSessionTimeLocked(true);
      return;
    }

    setSelectedSession(session);
    setIsSessionTimeLocked(false);
    
    // Calculate time remaining in session
    if (sessionObj) {
      const remaining = getSessionTimeRemaining(sessionObj);
      setCountdownTime(Math.max(0, remaining * 60)); // Convert minutes to seconds
    }
    
    setCurrentStep('scanner');
  };

  const handleDaySelect = (day: AttendanceDayId) => {
    if (selectedLevelConfig) {
      const pickedDay = selectedLevelConfig.days.find((item) => item.id === day);
      if (pickedDay && pickedDay.dayOfWeek !== todayWeekday) {
        toast.error(`Only ${todayWeekday} attendance is open today`);
        return;
      }
    }

    setSelectedDay(day);
    setSelectedSession(null);
    setCheckedInStudents([]);
    setCurrentStep('session');
  };

  const submitUnknownStudentApproval = (studentId: string) => {
    setUnknownStudentId(studentId);
    setUnknownStudentModalStep('confirm');
    setUnknownStudentName('');
    setUnknownStudentCampus('Lagos Island');
    setUnknownStudentModalOpen(true);
  };

  const handleUnknownStudentApprovalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLevel) {
      toast.error('No level selected');
      return;
    }

    if (!unknownStudentName.trim() || !unknownStudentId.trim()) {
      toast.error('Name and Student ID are required');
      return;
    }

    setSubmittingUnknownStudent(true);
    try {
      await approvalService.createApprovalRequest({
        id: Date.now() + Math.floor(Math.random() * 10000),
        studentId: unknownStudentId.trim().toUpperCase(),
        name: unknownStudentName.trim(),
        email: `${unknownStudentId.trim().toLowerCase()}@pending.local`,
        campus: unknownStudentCampus,
        level: selectedLevel,
        parentGuardian: 'N/A',
        parentPhone: 'N/A',
        notes: `Requested from scanner for ${selectedLevel}`,
        submittedBy: session?.displayName ?? session?.identifier ?? 'Volunteer',
        submittedAt: new Date().toLocaleString('en-US'),
        status: 'pending',
      });

      toast.success('Approval request sent to admin for review');
      setUnknownStudentModalOpen(false);
    } finally {
      setSubmittingUnknownStudent(false);
    }
  };

  const checkInStudent = async (student: Student) => {
    // Check if session is closed
    if (selectedLevel) {
      const isClosed = await sessionService.isSessionClosed(
        new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        selectedSessionLabel,
        selectedLevel,
        student.studentId
      );
      
      if (isClosed) {
        toast.error(`❌ Session is closed. Only exceptions allowed.`);
        return false;
      }
    }

    if (checkedInStudents.some((s) => s.studentId === student.studentId)) {
      toast.error(`${student.name} is already checked in`);
      return false;
    }

    const checkedInStudent: CheckedInStudent = {
      ...student,
      checkInTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      sessionName: selectedSessionLabel,
    };

    setCheckedInStudents((prev) => [checkedInStudent, ...prev]);
    toast.success(`✓ ${student.name} checked in`);

    await attendanceService.recordAttendance({
      id: Date.now() + Math.floor(Math.random() * 10000),
      studentId: student.studentId,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      session: selectedSessionLabel,
      status: 'present',
      volunteer: session?.displayName ?? session?.identifier ?? 'Volunteer',
      volunteerId: session?.identifier ?? 'VOL-LOCAL',
    });

    return true;
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSessionTimeLocked) {
      toast.error('❌ Session time window has closed. Cannot check in.');
      return;
    }
    
    const studentIdUpper = idInput.toUpperCase().trim();
    if (!studentIdUpper) {
      toast.error('Please enter a student ID');
      return;
    }

    if (!selectedLevel) {
      toast.error('Select a level before scanning');
      return;
    }

    const student = allStudents.find((s) => s.studentId.toUpperCase() === studentIdUpper);
    if (!student) {
      const otherLevel: AttendanceLevelId = selectedLevel === 'Level 1' ? 'Level 2' : 'Level 1';
      const inOtherLevel = studentsByLevel[otherLevel].some(
        (candidate) => candidate.studentId.toUpperCase() === studentIdUpper,
      );

      if (inOtherLevel) {
        toast.error('Student not in this level');
        setIdInput('');
        return;
      }

      submitUnknownStudentApproval(studentIdUpper);
      setIdInput('');
      return;
    }
    await checkInStudent(student);
    setIdInput('');
  };

  if (currentStep === 'level') {
    return (
      <div className="min-h-screen bg-[#f2f2f5] text-slate-900 antialiased font-sans">
        <Toaster position="top-right" richColors />
        <BrandHeader navigate={navigate} onBack={() => navigate('/volunteer/dashboard')} />

        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black">Select Level Attendance Session</h1>
          <p className="mt-4 text-base md:text-lg font-medium text-slate-700">Offline-first student attendance and records platform designed</p>
          <p className="text-base md:text-lg font-medium text-slate-700">for Bible School operations. Fast, reliable, and built for weekend sessions</p>

          <div className="mt-14 grid md:grid-cols-2 gap-10">
            {ATTENDANCE_LEVELS.map((level) => (
              <LevelSelectionCard key={level.id} level={level} onSelect={handleLevelSelect} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (currentStep === 'session') {
    const filteredSessions = selectedDayConfig?.sessions ?? [];

    if (!selectedLevelConfig || !selectedDayConfig) {
      return null;
    }

    return (
      <div className="min-h-screen bg-[#f2f2f5] text-slate-900 antialiased font-sans">
        <Toaster position="top-right" richColors />
        <BrandHeader navigate={navigate} onBack={() => setCurrentStep('day')} />

        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-16 pb-16 text-center">
          <div className="mx-auto w-fit rounded-md border border-slate-300 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            {selectedLevelConfig.id} • {selectedDayConfig.id}
          </div>
          <h1 className="mt-6 text-4xl md:text-5xl font-black tracking-tight text-black">{selectedDayConfig.label}</h1>
          <p className="mt-4 text-base md:text-lg font-medium text-slate-700">{selectedDayConfig.description}</p>

          {selectedDayConfig.sessionVariant === 'feature' ? (
            <div className="mt-14 mx-auto max-w-3xl space-y-6">
              {filteredSessions.map((session) => (
                <SessionSelectionCard key={session.name} day={selectedDayConfig} session={session} onSelect={handleSessionSelect} />
              ))}
            </div>
          ) : (
            <div className={`mt-14 grid items-stretch gap-8 ${selectedDayConfig.sessionGridClass}`}>
              {filteredSessions.map((session) => (
                <div key={session.name} className={session.spanFullRow ? 'md:col-span-2' : ''}>
                  <SessionSelectionCard day={selectedDayConfig} session={session} onSelect={handleSessionSelect} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  if (currentStep === 'day') {
    if (!selectedLevelConfig) {
      return null;
    }

    const openDays = selectedLevelConfig.days.filter((day) => day.dayOfWeek === todayWeekday);

    return (
      <div className="min-h-screen bg-[#f2f2f5] text-slate-900 antialiased font-sans">
        <Toaster position="top-right" richColors />
        <BrandHeader navigate={navigate} onBack={() => setCurrentStep('level')} />

        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-16 pb-16 text-center">
          <div className="mx-auto w-fit rounded-md border border-slate-300 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            {selectedLevelConfig.id}
          </div>
          <h1 className="mt-6 text-4xl md:text-5xl font-black tracking-tight text-black">Choose Attendance Day</h1>
          <p className="mt-4 text-base md:text-lg font-medium text-slate-700">Attendance day is auto-detected from today&apos;s schedule.</p>

          {openDays.length === 0 && (
            <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm font-medium">
              No attendance day is open for {todayWeekday}. Sessions are configured for Saturday and Sunday only.
            </div>
          )}

          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {openDays.map((day) => (
              <button
                key={day.id}
                onClick={() => handleDaySelect(day.id)}
                className="group w-full rounded-xl border border-slate-300 bg-[#f2f2f5] p-8 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-400 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="inline-flex rounded-md border border-slate-300 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      Attendance Day
                    </div>
                    <h2 className="mt-5 text-3xl font-black text-black">{day.id}</h2>
                    <p className="mt-3 text-base font-medium text-slate-700">{day.description}</p>
                  </div>
                  <div className="h-14 w-14 rounded-full bg-slate-200" />
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Proceed</span>
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-black text-white transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" richColors />
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentStep('session')} className="rounded-lg bg-slate-100 p-2 hover:bg-slate-200 transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-900" />
              </button>
              <div>
                <h1 className="text-2xl font-black tracking-tight">Attendance Scanner</h1>
                <p className="text-sm text-slate-600">{selectedLevel} — {selectedDay} — {selectedSession}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-slate-100 px-3 py-1 rounded-full flex items-center gap-2">
                <User className="w-4 h-4 text-slate-700" />
                <span className="text-slate-700 text-sm font-medium">Active today</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center font-bold text-sm">
                {checkedInStudents.length}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-black rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold">{selectedSession}</h3>
                  <p className="text-slate-400 text-sm">{selectedLevel}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-sm flex-1 flex flex-col">
              {isSessionTimeLocked ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
                    <Lock className="w-8 h-8 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Session Closed</h2>
                  <p className="text-slate-600 text-center mb-4">This attendance session is no longer active.</p>
                  <button
                    onClick={() => setCurrentStep('session')}
                    className="mt-6 px-6 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Choose Another Session
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 flex flex-col items-center justify-center mb-8">
                    <div className="w-64 h-64 border-4 border-slate-300 rounded-2xl flex items-center justify-center bg-slate-50">
                      <QrCode className="w-40 h-40 text-slate-400" />
                    </div>
                    <h3 className="text-center text-slate-900 mt-8 mb-2 text-2xl font-bold">Scan Student ID</h3>
                    <p className="text-center text-slate-600">Enter or scan a student ID card</p>
                  </div>

                  <form onSubmit={handleCheckIn} className="space-y-4">
                    <input
                      ref={inputRef}
                      type="text"
                      value={idInput}
                      onChange={(e) => setIdInput(e.target.value)}
                      className="w-full px-6 py-4 border-2 border-slate-300 bg-white text-slate-900 placeholder-slate-400 rounded-xl focus:border-slate-500 focus:outline-none transition-colors text-center font-semibold text-lg"
                      placeholder="Enter Student ID..."
                      autoFocus
                    />
                    <button type="submit" className="w-full py-4 px-6 rounded-xl font-bold bg-black text-white hover:bg-slate-900 transition-colors text-lg">
                      Log Attendance
                    </button>
                  </form>

                  <div className="mt-8 pt-8 border-t-2 border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-slate-500" />
                      <span className="text-slate-900 text-xl font-bold">{formatTime(countdownTime)}</span>
                    </div>
                    <span className="text-slate-600 text-sm">Time Remaining</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-sm">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-slate-600 text-xs font-semibold mb-1">Present</p>
                  <p className="text-slate-900 text-xl font-bold">{checkedInStudents.length}</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-lg bg-slate-400 flex items-center justify-center mx-auto mb-2">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-slate-600 text-xs font-semibold mb-1">Absent</p>
                  <p className="text-slate-900 text-xl font-bold">{allStudents.length - checkedInStudents.length}</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-slate-600 text-xs font-semibold mb-1">Rate</p>
                  <p className="text-slate-900 text-xl font-bold">{allStudents.length > 0 ? Math.round((checkedInStudents.length / allStudents.length) * 100) : 0}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm flex flex-col">
              <h3 className="text-slate-900 mb-4 flex items-center gap-2 font-bold">
                <CheckCircle className="w-5 h-5 text-slate-700" />
                Recent Check-ins
              </h3>
              {checkedInStudents.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center">
                  <p className="text-slate-600 text-sm">No scans yet</p>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto max-h-80 pr-1">
                  {checkedInStudents.map((student, index) => (
                    <div key={student.id} className="border-2 border-slate-200 rounded-lg p-3 bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
                          {student.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-slate-900 truncate text-sm font-semibold">{student.name}</h4>
                          <p className="text-slate-600 truncate text-xs">{student.studentId}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-slate-700" />
                <h3 className="text-slate-900 font-bold">Quick Lookup</h3>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-300 bg-white text-slate-900 placeholder-slate-400 rounded-lg focus:border-slate-500 focus:outline-none transition-colors text-sm mb-4"
                placeholder="Search by name or ID..."
              />
              {searchQuery ? (
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => {
                      const alreadyCheckedIn = checkedInStudents.some((s) => s.studentId === student.studentId);

                      return (
                      <button
                        key={student.id}
                        onClick={() => {
                          if (alreadyCheckedIn) {
                            toast.error(`${student.name} is already checked in`);
                            return;
                          }
                          setQuickLookupCandidate(student);
                        }}
                        className={`w-full border-2 rounded-lg p-3 transition-colors text-left ${
                          alreadyCheckedIn
                            ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                        }`}
                        disabled={alreadyCheckedIn}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {student.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-slate-900 truncate text-sm font-semibold">{student.name}</h4>
                            <p className="text-slate-600 text-xs">{student.studentId}</p>
                          </div>
                          {alreadyCheckedIn && <span className="text-[10px] font-bold uppercase tracking-wide">Checked in</span>}
                        </div>
                      </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-slate-600 text-sm">No students found</div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center">
                  <p className="text-slate-600 text-sm">Type a name or ID</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {unknownStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Unknown Student</h3>
                <p className="text-sm text-slate-600">Student ID {unknownStudentId} was not found in any level.</p>
              </div>
              <button
                onClick={() => setUnknownStudentModalOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {unknownStudentModalStep === 'confirm' ? (
              <div className="space-y-4 p-5">
                <p className="text-sm text-slate-700">
                  This ID is unknown. Do you want to add as a new student and send to admin for approval?
                </p>
                <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    onClick={() => setUnknownStudentModalOpen(false)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnknownStudentModalStep('form')}
                    className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Add as new student
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUnknownStudentApprovalSubmit} className="space-y-4 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Full Name</label>
                    <input
                      value={unknownStudentName}
                      onChange={(e) => setUnknownStudentName(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                      placeholder="Enter student full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Student ID</label>
                    <input
                      value={unknownStudentId}
                      onChange={(e) => setUnknownStudentId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                      placeholder="Enter student ID"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Level</label>
                    <input
                      value={selectedLevel ?? ''}
                      readOnly
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Campus</label>
                    <select
                      value={unknownStudentCampus}
                      onChange={(e) => setUnknownStudentCampus(e.target.value as 'Lagos Island' | 'Lagos Mainland')}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    >
                      <option value="Lagos Island">Lagos Island</option>
                      <option value="Lagos Mainland">Lagos Mainland</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    onClick={() => setUnknownStudentModalStep('confirm')}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submittingUnknownStudent}
                    className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    {submittingUnknownStudent ? 'Sending...' : 'Send For Approval'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {quickLookupCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <h3 className="text-lg font-bold text-slate-900">Confirm Check-in</h3>
              <button
                onClick={() => setQuickLookupCandidate(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm text-slate-700 mb-4">Do you want to check in this student?</p>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="font-semibold text-slate-900">{quickLookupCandidate.name}</p>
                <p className="text-xs text-slate-600 mt-1">{quickLookupCandidate.studentId}</p>
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setQuickLookupCandidate(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void (async () => {
                      const didCheckIn = await checkInStudent(quickLookupCandidate);
                      if (didCheckIn) {
                        setSearchQuery('');
                      }
                      setQuickLookupCandidate(null);
                    })();
                  }}
                  className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Check in student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
