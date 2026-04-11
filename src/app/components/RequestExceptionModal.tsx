import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Send, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../features/auth/AuthProvider';
import { exceptionService, EXCEPTION_REASONS, type ExceptionReason } from '../../features/exceptions/exceptionService';
import { ATTENDANCE_LEVELS, ATTENDANCE_LEVEL_MAP, type AttendanceLevelId } from '../pages/volunteer/attendance/config';
import { studentService } from '../../features/students/studentService';

interface RequestExceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLevel?: AttendanceLevelId;
}

export function RequestExceptionModal({ isOpen, onClose, defaultLevel = 'Level 1' }: RequestExceptionModalProps) {
  const { session } = useAuth();
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [reason, setReason] = useState<ExceptionReason>('other');
  const [otherReason, setOtherReason] = useState('');
  const [details, setDetails] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSession, setSelectedSession] = useState('');
  const [level, setLevel] = useState<AttendanceLevelId>(defaultLevel);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const levelConfig = ATTENDANCE_LEVEL_MAP[level];
  const allSessions = levelConfig.days.flatMap((day) => day.sessions.map((s) => s.name));

  // Reset session when level changes
  useEffect(() => {
    setSelectedSession('');
  }, [level]);

  // Auto-populate student name when ID changes
  useEffect(() => {
    if (!studentId.trim()) {
      setStudentName('');
      return;
    }

    const lookupStudent = async () => {
      try {
        const students = await studentService.listStudents();
        const found = students.find((s) => s.studentId === studentId.trim().toUpperCase());
        if (found) {
          setStudentName(found.name);
        } else {
          setStudentName('');
        }
      } catch (err) {
        console.error('Failed to lookup student:', err);
        setStudentName('');
      }
    };

    lookupStudent();
  }, [studentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, boolean> = {};
    if (!studentId.trim()) newErrors.studentId = true;
    if (!selectedSession) newErrors.session = true;
    if (reason === 'other' && !otherReason.trim()) newErrors.otherReason = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill in all required fields');
      return;
    }
    setErrors({});

    setIsSubmitting(true);
    try {
      const finalDetails = reason === 'other' && otherReason ? `${otherReason}\n\n${details}` : details;

      await exceptionService.createException({
        id: Date.now() + Math.floor(Math.random() * 10000),
        studentId: studentId.trim().toUpperCase(),
        date: selectedDate,
        session: selectedSession,
        level,
        reason,
        details: finalDetails,
        requestedBy: session?.displayName ?? session?.identifier ?? 'Volunteer',
        requestedAt: new Date().toLocaleString('en-US'),
        status: 'pending',
      });

      setSubmitSuccess(true);
      setStudentId('');
      setStudentName('');
      setDetails('');
      setOtherReason('');
      setReason('other');
      setSelectedSession('');
      setErrors({});
    } catch (err) {
      toast.error('Failed to submit exception request');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-close modal after success confirmation
  useEffect(() => {
    if (!submitSuccess) return;
    const timer = setTimeout(() => {
      setSubmitSuccess(false);
      onClose();
    }, 2500);
    return () => clearTimeout(timer);
  }, [submitSuccess, onClose]);

  if (!isOpen) return null;

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl border border-green-200 bg-gradient-to-b from-green-50 to-white shadow-lg p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Exception Submitted!</h2>
          <p className="text-slate-600 mb-2">Your request has been sent to admin for review.</p>
          <p className="text-sm text-slate-500">Status: <span className="font-semibold text-orange-600">Pending</span></p>
          <div className="mt-6 w-full bg-slate-100 rounded-lg p-3 text-left text-sm text-slate-700">
            <p><span className="font-semibold">Student:</span> {studentName || studentId}</p>
            <p><span className="font-semibold">Date:</span> {selectedDate}</p>
            <p><span className="font-semibold">Session:</span> {selectedSession}</p>
          </div>
          <p className="text-xs text-slate-500 mt-6 italic">Closing in a moment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50 to-white shadow-lg">
        <div className="flex items-center justify-between border-b border-orange-100 p-5">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-bold text-slate-900">Request Exception</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {/* Level */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Level *</label>
            <div className="flex gap-2">
              {ATTENDANCE_LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setLevel(lvl.id as AttendanceLevelId)}
                  disabled={isSubmitting}
                  className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm border transition-colors ${
                    level === lvl.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {lvl.id}
                </button>
              ))}
            </div>
          </div>

          {/* Student ID */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Student ID *</label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => { setStudentId(e.target.value.toUpperCase()); setErrors(p => ({ ...p, studentId: false })); }}
              placeholder="e.g., STU001"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.studentId ? 'border-red-500 bg-red-50' : 'border-slate-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.studentId && <p className="text-red-500 text-xs mt-1">Student ID is required</p>}
            {studentName && (
              <div className="mt-2 flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800 font-medium">{studentName}</span>
              </div>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Date *</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Session */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Session *</label>
            <select
              value={selectedSession}
              onChange={(e) => { setSelectedSession(e.target.value); setErrors(p => ({ ...p, session: false })); }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.session ? 'border-red-500 bg-red-50' : 'border-slate-300'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Select a session...</option>
              {allSessions.map((session) => (
                <option key={session} value={session}>
                  {session}
                </option>
              ))}
            </select>
            {errors.session && <p className="text-red-500 text-xs mt-1">Session is required</p>}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Reason *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ExceptionReason)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {Object.entries(EXCEPTION_REASONS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Specify Other Reason - Only shows when "other" is selected */}
          {reason === 'other' && (
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Specify Other Reason *</label>
              <input
                type="text"
                value={otherReason}
                onChange={(e) => { setOtherReason(e.target.value); setErrors(p => ({ ...p, otherReason: false })); }}
                placeholder="What is the reason for this exception?"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.otherReason ? 'border-red-500 bg-red-50' : 'border-slate-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.otherReason && <p className="text-red-500 text-xs mt-1">Please specify the reason</p>}
            </div>
          )}

          {/* Details */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Details (Optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Explain why this exception is needed..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-60"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Sending...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
