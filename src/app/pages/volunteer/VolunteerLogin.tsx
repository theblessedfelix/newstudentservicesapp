import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LogIn, User, Lock, ArrowLeft } from 'lucide-react';
import AppNavbar from '../../../components/AppNavbar';

export default function VolunteerLogin() {
  const navigate = useNavigate();
  const [volunteerId, setVolunteerId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (volunteerId && password) {
      navigate('/volunteer/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f5] flex flex-col font-sans antialiased text-black">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <AppNavbar ctaHref="/volunteer" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[380px]">
          
          {/* Login Card - High Contrast White & Black */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-200 p-8">
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-black">
                Volunteer Login
              </h2>
              <p className="text-gray-500 text-sm mt-2 font-medium">
                Enter your credentials to continue
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="volunteerId" className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Volunteer ID
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="volunteerId"
                    value={volunteerId}
                    onChange={(e) => setVolunteerId(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:border-black focus:outline-none transition-all text-sm font-medium"
                    placeholder="VOL001"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:border-black focus:outline-none transition-all text-sm font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* The Strong Black Button */}
              <button
                type="submit"
                className="w-full bg-black text-white py-3.5 px-6 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all active:scale-[0.98] mt-2 shadow-lg shadow-gray-200"
              >
                Sign In
              </button>
            </form>

            <button
              onClick={() => navigate('/attendance-portal')}
              className="w-full mt-8 flex items-center justify-center gap-2 text-gray-400 hover:text-black font-bold text-[11px] uppercase tracking-widest transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Home
            </button>
          </div>

          {/* Credentials Helper */}
          <div className="mt-8 px-6 py-4 bg-orange-50 border border-orange-100 rounded-xl">
            <h4 className="text-orange-800 text-[10px] font-black uppercase tracking-widest mb-1">
              Demo Access
            </h4>
            <p className="text-orange-700 text-xs font-medium">
              ID: <code className="bg-white px-1.5 py-0.5 rounded font-bold text-orange-900">VOL001</code>
              <span className="mx-2">|</span>
              Pass: <code className="bg-white px-1.5 py-0.5 rounded font-bold text-orange-900">volunteer123</code>
            </p>
          </div>

        </div>
      </div>

      <footer className="py-8 text-center bg-white border-t border-gray-100">
          <p className="italic text-gray-400 text-xs font-serif">
            "Whatever you do, do it with all your heart"
          </p>
      </footer>
    </div>
  );
}