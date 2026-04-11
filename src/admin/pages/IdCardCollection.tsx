import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import AppNavbar from '../../components/AppNavbar';
import PageBackButton from '../../components/PageBackButton';
import { studentService } from '../../features/students/studentService';
import { useAuth } from '../../features/auth/AuthProvider';

interface Student {
  id: number;
  name: string;
  studentId: string;
  campus: string;
  level: string;
  status: 'N/A' | 'COLLECTED' | 'PENDING' | 'NOT PRODUCED';
}

interface PersistedStudent {
  id: number;
  name: string;
  studentId: string;
  campus: string;
  level: string;
}

export default function IdCardCollection() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COLLECTED' | 'PENDING'>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (!session || session.role !== 'admin') {
      navigate('/');
    }
  }, [navigate, session]);


  useEffect(() => {
    let mounted = true;

    const loadStudents = async () => {
      try {
        const persistedStudents = await studentService.listStudents();
        const normalized = (persistedStudents as PersistedStudent[])
          .map((student) => ({
            id: student.id,
            name: student.name,
            studentId: student.studentId,
            campus: student.campus,
            level: student.level,
            status: 'PENDING' as const,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        if (mounted) {
          setStudents(normalized);
        }
      } catch (error) {
        console.error('Failed to load students for ID card collection', error);
      }
    };

    void loadStudents();
    const unsubscribe = studentService.subscribe(() => {
      void loadStudents();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const pendingCount = students.filter((s) => s.status === 'PENDING').length;
  const collectedCount = students.filter((s) => s.status === 'COLLECTED').length;

  const handleStatusChange = (studentId: number, newStatus: Student['status']) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: newStatus } : s));
    setSelectedStudent(null);
  };

  const getStatusChipClass = (status: Student['status']) => {
    if (status === 'COLLECTED') return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    if (status === 'PENDING') return 'bg-amber-100 text-amber-800 border border-amber-200';
    return 'bg-slate-100 text-slate-700 border border-slate-200';
  };

  const getStatusButtonClass = (status: Student['status']) => {
    if (status === 'COLLECTED') return 'bg-emerald-700 hover:bg-emerald-800';
    if (status === 'PENDING') return 'bg-amber-600 hover:bg-amber-700';
    return 'bg-slate-700 hover:bg-slate-800';
  };

  return (
    <div className="min-h-screen bg-[#f2f2f5] text-slate-900 antialiased">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-16">
          <AppNavbar ctaHref="/admin#/dashboard" />
        </div>

        <div className="mb-8">
          <PageBackButton onClick={() => navigate('/dashboard')} label="Back to Dashboard" />
        </div>

        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black mb-4">
            ID Collection Portal
          </h1>
          <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
            Manage card collection progress with fast search, clean status filters,
            <br className="hidden sm:block" />
            and quick updates for Bible School weekend operations.
          </p>
        </div>

        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col lg:flex-row items-start gap-6">
            <div className="w-full lg:flex-1">
              <input
                type="text"
                placeholder="Search by name or student ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>

            <div className="w-full lg:w-auto">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Filter by status</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`h-10 min-w-24 rounded-lg px-4 text-xs font-bold tracking-widest uppercase transition-colors cursor-pointer ${
                    statusFilter === 'ALL' ? 'bg-black text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  All ({students.length})
                </button>
                <button
                  onClick={() => setStatusFilter('COLLECTED')}
                  className={`h-10 min-w-28 rounded-lg px-4 text-xs font-bold tracking-widest uppercase transition-colors cursor-pointer ${
                    statusFilter === 'COLLECTED' ? 'bg-emerald-700 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Collected {collectedCount > 0 ? `(${collectedCount})` : ''}
                </button>
                <button
                  onClick={() => setStatusFilter('PENDING')}
                  className={`h-10 min-w-28 rounded-lg px-4 text-xs font-bold tracking-widest uppercase transition-colors cursor-pointer ${
                    statusFilter === 'PENDING' ? 'bg-amber-600 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Pending {pendingCount > 0 ? `(${pendingCount})` : ''}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-16">
          {filteredStudents.map((student) => (
            <div 
              key={student.id} 
              onClick={() => setSelectedStudent(student)}
              className="grid grid-cols-[56px_1fr_auto] sm:grid-cols-[72px_minmax(180px,1fr)_130px_150px_110px_120px] items-center gap-4 sm:gap-6 bg-white border border-slate-200 rounded-2xl px-4 sm:px-8 py-4 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black flex items-center justify-center text-white font-bold text-xs">
                {getInitials(student.name)}
              </div>

              <div className="min-w-0">
                <p className="text-lg sm:text-xl font-semibold text-black leading-tight">{student.name}</p>
                <p className="sm:hidden mt-1 text-xs text-slate-500">{student.studentId} • {student.campus} • {student.level}</p>
              </div>

              <p className="hidden sm:block text-sm font-medium uppercase tracking-wide text-slate-800">{student.studentId}</p>
              <p className="hidden sm:block text-sm font-medium uppercase tracking-wide text-slate-800">{student.campus}</p>
              <p className="hidden sm:block text-sm font-medium uppercase tracking-wide text-slate-800">{student.level}</p>

              <div className="justify-self-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStudent(student);
                  }}
                  className={`h-9 min-w-24 rounded-lg text-xs sm:text-sm font-semibold px-4 transition-colors cursor-pointer ${getStatusChipClass(student.status)}`}
                >
                  {student.status}
                </button>
              </div>
            </div>
          ))}

          {filteredStudents.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-600 font-medium">No records found for this search/filter combination.</p>
            </div>
          )}
        </div>

        <footer className="py-8 text-center">
          <p className="text-slate-500 text-xs">© 2026 Student Services. All rights reserved.</p>
        </footer>
      </div>

      {/* Modal / Overlay */}
      {selectedStudent && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" 
          onClick={() => setSelectedStudent(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-xl bg-slate-900 flex items-center justify-center text-white text-lg font-bold">
                  {getInitials(selectedStudent.name)}
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{selectedStudent.name}</h2>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">{selectedStudent.studentId}</p>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Update Record</label>
                <button 
                  onClick={() => handleStatusChange(selectedStudent.id, 'COLLECTED')} 
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-all active:scale-95 cursor-pointer"
                >
                  Mark as Collected
                </button>
                <button 
                  onClick={() => handleStatusChange(selectedStudent.id, 'PENDING')} 
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all active:scale-95 cursor-pointer"
                >
                  Mark as Pending
                </button>
                <button 
                  onClick={() => handleStatusChange(selectedStudent.id, 'N/A')} 
                  className="w-full py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-bold transition-all active:scale-95 cursor-pointer"
                >
                  Mark as Not Available (N/A)
                </button>
              </div>

              <button 
                onClick={() => setSelectedStudent(null)} 
                className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors text-sm"
              >
                Cancel and Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}