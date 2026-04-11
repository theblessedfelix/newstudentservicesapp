import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Shield, ArrowRight } from 'lucide-react';
import AppNavbar from '../../components/AppNavbar';
import { useAuth } from '../../features/auth/AuthProvider';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { session, signInWithRole } = useAuth();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (session?.role === 'admin') {
      navigate('/dashboard');
    }
  }, [navigate, session]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await signInWithRole({
        identifier: adminId.trim(),
        password,
        role: 'admin',
      });
      navigate('/dashboard');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f5] text-slate-900 antialiased">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <AppNavbar
          ctaHref="/admin.html#/dashboard"
          items={[
            { label: 'Add new student', href: '/admin.html#/students' },
            { label: 'ID Collection', href: '/admin.html#/id-cards' },
            { label: 'Volunteer Sign up', href: '/admin.html#/volunteers' },
            { label: 'Knowledge Based', href: '/admin.html#/reports' },
            { label: 'RHEMA Website', href: '/admin.html#/' },
          ]}
        />

        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="w-full max-w-xl rounded-3xl border border-gray-300 bg-[#efefef] p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500 font-semibold">Admin Portal</p>
                <h1 className="text-3xl font-bold text-black">Bible School</h1>
              </div>
            </div>

            <p className="text-slate-700 mb-8 leading-7">
              Sign in to manage records, process approvals, run reports, and maintain ID collection workflows.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="Admin ID"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-slate-800 focus:border-black focus:outline-none"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-slate-800 focus:border-black focus:outline-none"
              />
              <div className="rounded-xl border border-gray-300 bg-white p-4 text-sm text-slate-600">
                Temporary admin login 
              </div>
              {errorMessage && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {errorMessage}
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-black px-5 py-3 text-white font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? 'Signing In...' : 'Enter Admin Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
