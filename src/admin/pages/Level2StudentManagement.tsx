import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, Search, Users, X, Plus, Edit2, Trash2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import AppNavbar from '../../components/AppNavbar';
import PageBackButton from '../../components/PageBackButton';
import { getLevel2ScannerStudents } from '../../app/data/level2StudentRegistry';
import { attendanceService } from '../../features/attendance/attendanceService';
import { studentService } from '../../features/students/studentService';
import { useAuth } from '../../features/auth/AuthProvider';

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

interface PersistedAttendanceRecord {
  studentId: string;
  date: string;
  session: string;
  status: 'present' | 'absent';
  volunteer: string;
}

export default function Level2StudentManagement() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newStudent, setNewStudent] = useState({
    studentId: '',
    name: '',
    email: '',
    campus: 'Lagos Island' as 'Lagos Island' | 'Lagos Mainland',
    enrollmentDate: '',
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceByStudent, setAttendanceByStudent] = useState<Record<string, AttendanceRecord[]>>({});

  useEffect(() => {
    if (!session || session.role !== 'admin') {
      navigate('/');
    }
  }, [navigate, session]);


  useEffect(() => {
    let mounted = true;

    const loadStudents = async () => {
      try {
        const [persistedLevel2Students, allAttendance] = await Promise.all([
          studentService.listStudentsByLevel('Level 2'),
          attendanceService.listAttendanceRecords(),
        ]);

        const registryStudents: Student[] = getLevel2ScannerStudents().map((student) => ({
          id: Number(student.studentId),
          studentId: student.studentId,
          name: student.name,
          campus: 'Lagos Island',
          level: 'Level 2',
          email: `${student.studentId.toLowerCase()}@student.local`,
          enrollmentDate: '',
        }));

        const merged = new Map<string, Student>();
        for (const student of registryStudents) {
          merged.set(student.studentId, student);
        }
        for (const student of persistedLevel2Students) {
          merged.set(student.studentId, student);
        }

        const mergedStudents = Array.from(merged.values());
        const studentIdSet = new Set(mergedStudents.map((student) => student.studentId));
        const attendance = (allAttendance as PersistedAttendanceRecord[])
          .filter((record) => studentIdSet.has(record.studentId))
          .reduce<Record<string, AttendanceRecord[]>>((acc, record) => {
            if (!acc[record.studentId]) {
              acc[record.studentId] = [];
            }

            acc[record.studentId].push({
              date: record.date,
              session: record.session,
              status: record.status,
              volunteer: record.volunteer,
            });
            return acc;
          }, {});

        if (mounted) {
          setStudents(mergedStudents);
          setAttendanceByStudent(attendance);
        }
      } catch (error) {
        console.error('Error loading Level 2 students:', error);
      }
    };

    void loadStudents();
    const unsubscribeStudents = studentService.subscribe(() => {
      void loadStudents();
    });
    const unsubscribeAttendance = attendanceService.subscribe(() => {
      void loadStudents();
    });

    return () => {
      mounted = false;
      unsubscribeStudents();
      unsubscribeAttendance();
    };
  }, []);

  const getAttendanceHistory = (studentId: string): AttendanceRecord[] => {
    return attendanceByStudent[studentId] || [];
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

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const idExists = students.some((s) => s.studentId.toLowerCase() === newStudent.studentId.trim().toLowerCase());
    if (idExists) {
      toast.error('Student ID already exists');
      return;
    }
    const emailExists = students.some((s) => s.email.toLowerCase() === newStudent.email.trim().toLowerCase());
    if (emailExists) {
      toast.error('Email already exists');
      return;
    }
    const created: Student = {
      id: Date.now(),
      studentId: newStudent.studentId.trim().toUpperCase(),
      name: newStudent.name.trim(),
      email: newStudent.email.trim().toLowerCase(),
      campus: newStudent.campus,
      level: 'Level 2',
      enrollmentDate: newStudent.enrollmentDate || new Date().toLocaleDateString(),
    };
    setStudents((prev) => [created, ...prev]);
    void studentService.saveStudent(created);
    setNewStudent({ studentId: '', name: '', email: '', campus: 'Lagos Island', enrollmentDate: '' });
    setShowAddForm(false);
    toast.success(`✓ Student ${created.name} added`);
  };

  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const idExists = students.some((s) => s.studentId.toLowerCase() === editingStudent.studentId.trim().toLowerCase() && s.id !== editingStudent.id);
    if (idExists) {
      toast.error('Student ID already exists');
      return;
    }
    const emailExists = students.some((s) => s.email.toLowerCase() === editingStudent.email.trim().toLowerCase() && s.id !== editingStudent.id);
    if (emailExists) {
      toast.error('Email already exists');
      return;
    }

    setStudents((prev) => prev.map((s) => (s.id === editingStudent.id ? editingStudent : s)));
    setSelectedStudent(editingStudent);
    setIsEditMode(false);
    setEditingStudent(null);
    void studentService.saveStudent(editingStudent);
    toast.success(`✓ Student ${editingStudent.name} updated`);
  };

  const handleDeleteStudent = (student: Student) => {
    if (confirm(`Are you sure you want to delete ${student.name}? This action cannot be undone.`)) {
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
      setSelectedStudent(null);
      toast.success(`✓ Student ${student.name} deleted`);
      void studentService.deleteStudent(student.id);
    }
  };

  const startEdit = (student: Student) => {
    setEditingStudent({ ...student });
    setIsEditMode(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <Toaster position="top-right" richColors />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-16">
          <AppNavbar ctaHref="/admin#/dashboard" />
        </div>

        <div className="mb-8">
          <PageBackButton onClick={() => window.history.back()} />
        </div>

        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black mb-4">
            Level 2: Attendance Records
          </h1>
          <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
            View and manage attendance records for Level 2 students. Click on any student
            <br className="hidden sm:block" />
            to see their detailed attendance history and session participation.
          </p>
        </div>

        {/* Add New Student Section */}
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-900">{showAddForm ? 'Add New Student' : 'Add New Student'}</h2>
          </div>
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 rounded-lg bg-black hover:bg-gray-900 text-white text-sm font-semibold transition-colors"
            >
              + Add Student
            </button>
          ) : (
            <form onSubmit={handleAddStudent} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <input
                required
                value={newStudent.studentId}
                onChange={(e) => setNewStudent((prev) => ({ ...prev, studentId: e.target.value }))}
                placeholder="Student ID"
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none transition-colors"
              />
              <input
                required
                value={newStudent.name}
                onChange={(e) => setNewStudent((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Full name"
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none transition-colors"
              />
              <input
                required
                type="email"
                value={newStudent.email}
                onChange={(e) => setNewStudent((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none transition-colors"
              />
              <select
                value={newStudent.campus}
                onChange={(e) => setNewStudent((prev) => ({ ...prev, campus: e.target.value as 'Lagos Island' | 'Lagos Mainland' }))}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none transition-colors"
              >
                <option>Lagos Island</option>
                <option>Lagos Mainland</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-black hover:bg-gray-900 text-white text-sm font-semibold px-4 py-3 transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewStudent({ studentId: '', name: '', email: '', campus: 'Lagos Island', enrollmentDate: '' });
                  }}
                  className="flex-1 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
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
                <div className="flex justify-between items-center mb-4">
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

                <div className="flex gap-2 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => startEdit(selectedStudent)}
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(selectedStudent)}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditMode && editingStudent && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setIsEditMode(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-black p-6 rounded-t-2xl sticky top-0">
              <h2 className="text-white text-2xl font-bold">Edit Student</h2>
            </div>

            <form onSubmit={handleUpdateStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Student ID</label>
                <input
                  required
                  value={editingStudent.studentId}
                  onChange={(e) => setEditingStudent({ ...editingStudent, studentId: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <input
                  required
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                  required
                  type="email"
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Campus</label>
                <select
                  value={editingStudent.campus}
                  onChange={(e) => setEditingStudent({ ...editingStudent, campus: e.target.value as 'Lagos Island' | 'Lagos Mainland' })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none transition-colors"
                >
                  <option>Lagos Island</option>
                  <option>Lagos Mainland</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Enrollment Date</label>
                <input
                  type="text"
                  value={editingStudent.enrollmentDate}
                  onChange={(e) => setEditingStudent({ ...editingStudent, enrollmentDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-slate-400 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-200">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-lg bg-black hover:bg-gray-900 text-white font-semibold transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className="flex-1 px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
