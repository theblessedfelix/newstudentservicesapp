import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Send, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../features/auth/AuthProvider';
import { exceptionService, EXCEPTION_REASONS, type ExceptionReason } from '../../features/exceptions/exceptionService';
import { ATTENDANCE_LEVEL_MAP, type AttendanceLevelId } from '../pages/volunteer/attendance/config';
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
  const [level] = useState<AttendanceLevelId>(defaultLevel);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const levelConfig = ATTENDANCE_LEVEL_MAP[level];
  const allSessions = levelConfig.days.flatMap((day) => day.sessions.map((s) => s.name));

  // Auto-populate student name when ID changes
  useEffect(() => {
    if (!studentId.trim()) {
      setStudentName('');
      return;
    }

    const lookupStudent = async () => {
      try {
        const students = await studentService.listStudents();
        const found = students.find((s) => s.id === studentId.toUpperCase());
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

    if (!studentId.trim()) {
      toast.error('Please enter a student ID');
      return;
    }

    if (!selectedSession) {
      toast.error('Please select a session');
      return;
    }

    if (reason === 'other' && !otherReason.trim()) {
      toast.error('Please specify the other reason');
      return;
    }

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

      toast.success('✓ Exception request received and sent to admin for review');
      setStudentId('');
      setStudentName('');
      setDetails('');
      setOtherReason('');
      setReason('other');
      setSelectedSession('');
      onClose();
    } catch (err) {
      toast.error('Failed to submit exception request');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
          {/* Student ID */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Student ID *</label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.toUpperCase())}
              placeholder="e.g., STU001"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
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
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option value="">Select a session...</option>
              {allSessions.map((session) => (
                <option key={session} value={session}>
                  {session}
                </option>
              ))}
            </select>
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
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="What is the reason for this exception?"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={isSubmitting}
              />
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
