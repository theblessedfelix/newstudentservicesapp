import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, UserPlus, User, GraduationCap, MapPin } from 'lucide-react';
import AppNavbar from '../../../components/AppNavbar';

export default function RegisterStudent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    level: '',
    campus: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Student registration submitted for admin approval!');
    navigate('/volunteer/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] font-sans antialiased text-slate-800">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <AppNavbar ctaHref="/volunteer" />
      </div>
      <div className="max-w-xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8 sm:p-10">
          
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-6 h-6 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800">
              Student Details
            </h2>
            <p className="text-slate-500 text-sm mt-1.5 font-medium">
              Please provide accurate info for admin review.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Student ID */}
            <div>
              <label htmlFor="studentId" className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-2 ml-1">
                Student ID <span className="text-orange-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-500 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="studentId"
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-400 focus:outline-none transition-all text-sm text-slate-700 placeholder:text-slate-300"
                  placeholder="e.g. STU001"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-2 ml-1">
                Full Name <span className="text-orange-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-500 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-400 focus:outline-none transition-all text-sm text-slate-700 placeholder:text-slate-300"
                  placeholder="Enter legal name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Level Select */}
              <div>
                <label htmlFor="level" className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-2 ml-1">
                  Level <span className="text-orange-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-500 z-10 pointer-events-none">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <select
                    id="level"
                    required
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full pl-11 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-400 focus:outline-none transition-all text-sm text-slate-600 appearance-none cursor-pointer"
                  >
                    <option value="">Select</option>
                    <option value="level1">Level 1</option>
                    <option value="level2">Level 2</option>
                  </select>
                </div>
              </div>

              {/* Campus Select */}
              <div>
                <label htmlFor="campus" className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-2 ml-1">
                  Campus <span className="text-orange-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-500 z-10 pointer-events-none">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <select
                    id="campus"
                    required
                    value={formData.campus}
                    onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                    className="w-full pl-11 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-400 focus:outline-none transition-all text-sm text-slate-600 appearance-none cursor-pointer"
                  >
                    <option value="">Select</option>
                    <option value="lagos_island">Lagos Island</option>
                    <option value="lagos_mainland">Lagos Mainland</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Note Section */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-2">
              <p className="text-slate-500 text-[11px] font-medium leading-relaxed">
                <span className="font-bold text-slate-400 uppercase tracking-wider mr-1.5">Note:</span> 
                This entry will remain hidden from lists until an admin approves the record.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <button
                type="button"
                onClick={() => navigate('/volunteer/dashboard')}
                className="flex-1 order-2 sm:order-1 bg-white border border-slate-200 text-slate-400 py-3 px-6 rounded-xl font-bold text-[13px] hover:bg-slate-50 hover:text-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 order-1 sm:order-2 bg-slate-900 text-white py-3 px-6 rounded-xl font-bold text-[13px] hover:bg-black transition-all active:scale-[0.98] shadow-sm shadow-slate-200"
              >
                Submit Entry
              </button>
            </div>
          </form>
        </div>
      </div>

      <footer className="py-12 text-center">
        <p className="italic text-slate-300 text-xs font-serif">
          "Excellence in service."
        </p>
      </footer>
    </div>
  );
}