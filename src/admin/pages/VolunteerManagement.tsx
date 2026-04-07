import { useMemo, useState } from 'react';
import { Calendar, Shield, UserPlus, X } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import AppNavbar from '../../components/AppNavbar';

type VolunteerStatus = 'active' | 'inactive';

interface Volunteer {
  id: number;
  volunteerId: string;
  name: string;
  email: string;
  campus: 'Lagos Island' | 'Lagos Mainland';
  status: VolunteerStatus;
  lastSeen: string;
  passwordLastUpdated: string;
  mustChangePassword: boolean;
}

interface RegistrationRequest {
  id: number;
  name: string;
  email: string;
  campus: 'Lagos Island' | 'Lagos Mainland';
  requestedAt: string;
}

interface VolunteerActivity {
  date: string;
  session: string;
  action: string;
  details: string;
}

export default function VolunteerManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);

  const [newVolunteer, setNewVolunteer] = useState({
    volunteerId: '',
    name: '',
    email: '',
    campus: 'Lagos Island' as 'Lagos Island' | 'Lagos Mainland',
  });

  const [volunteers, setVolunteers] = useState<Volunteer[]>([
    { id: 1, volunteerId: 'VOL001', name: 'Adebayo Lawal', email: 'adebayo@bibleschool.edu', campus: 'Lagos Island', status: 'active', lastSeen: 'Apr 6, 2026 10:12 AM', passwordLastUpdated: 'Apr 1, 2026', mustChangePassword: false },
    { id: 2, volunteerId: 'VOL002', name: 'Grace Nnaji', email: 'grace@bibleschool.edu', campus: 'Lagos Mainland', status: 'active', lastSeen: 'Apr 6, 2026 09:47 AM', passwordLastUpdated: 'Mar 28, 2026', mustChangePassword: true },
    { id: 3, volunteerId: 'VOL003', name: 'David Akin', email: 'david@bibleschool.edu', campus: 'Lagos Island', status: 'inactive', lastSeen: 'Apr 1, 2026 03:20 PM', passwordLastUpdated: 'Feb 20, 2026', mustChangePassword: false },
    { id: 4, volunteerId: 'VOL004', name: 'Ruth Okafor', email: 'ruth@bibleschool.edu', campus: 'Lagos Mainland', status: 'active', lastSeen: 'Apr 5, 2026 05:02 PM', passwordLastUpdated: 'Apr 3, 2026', mustChangePassword: false },
  ]);

  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([
    { id: 101, name: 'Moses Daniel', email: 'moses.daniel@bibleschool.edu', campus: 'Lagos Island', requestedAt: 'Apr 6, 2026 08:12 AM' },
    { id: 102, name: 'Chioma Peter', email: 'chioma.peter@bibleschool.edu', campus: 'Lagos Mainland', requestedAt: 'Apr 6, 2026 09:02 AM' },
  ]);

  const getVolunteerActivity = (volunteerId: string): VolunteerActivity[] => {
    const baseData: Record<string, VolunteerActivity[]> = {
      'VOL001': [
        { date: 'Apr 6, 2026', session: 'Morning Session', action: 'Check-in', details: 'Checked in 15 students' },
        { date: 'Mar 30, 2026', session: 'Morning Session', action: 'Check-in', details: 'Checked in 12 students' },
        { date: 'Mar 23, 2026', session: 'Morning Session', action: 'Check-in', details: 'Checked in 18 students' },
        { date: 'Mar 16, 2026', session: 'Morning Session', action: 'Check-in', details: 'Checked in 14 students' },
        { date: 'Mar 9, 2026', session: 'Morning Session', action: 'Check-in', details: 'Checked in 16 students' },
      ],
      'VOL002': [
        { date: 'Apr 6, 2026', session: 'Morning Session', action: 'Check-in', details: 'Checked in 22 students' },
        { date: 'Mar 30, 2026', session: 'Morning Session', action: 'Check-in', details: 'Checked in 19 students' },
        { date: 'Mar 23, 2026', session: 'Morning Session', action: 'Check-in', details: 'Checked in 25 students' },
        { date: 'Mar 16, 2026', session: 'Morning Session', action: 'Check-in', details: 'Checked in 21 students' },
      ],
      'VOL003': [
        { date: 'Apr 1, 2026', session: 'Morning Session', action: 'Check-in', details: 'Checked in 8 students' },
        { date: 'Mar 23, 2026', session: 'Morning Session', action: 'Check-in', details: 'Checked in 11 students' },
        { date: 'Mar 16, 2026', session: 'Morning Session', action: 'Check-in', details: 'Checked in 9 students' },
      ],
      'VOL004': [
        { date: 'Apr 5, 2026', session: 'Afternoon Session', action: 'Check-in', details: 'Checked in 17 students' },
        { date: 'Mar 30, 2026', session: 'Morning Session', action: 'Check-in', details: 'Checked in 20 students' },
        { date: 'Mar 23, 2026', session: 'Morning Session', action: 'Check-in', details: 'Checked in 23 students' },
        { date: 'Mar 16, 2026', session: 'Morning Session', action: 'Check-in', details: 'Checked in 18 students' },
        { date: 'Mar 9, 2026', session: 'Morning Session', action: 'Check-in', details: 'Checked in 21 students' },
      ],
    };
    return baseData[volunteerId] || [];
  };

  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((volunteer) => {
      const matchSearch =
        volunteer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        volunteer.volunteerId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [volunteers, searchQuery]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getActivityStats = (volunteerId: string) => {
    const activities = getVolunteerActivity(volunteerId);
    const sessions = activities.length;
    const lastActivity = activities.length > 0 ? activities[0].date : 'Never';
    return { sessions, lastActivity };
  };

  const handleCreateVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    const idExists = volunteers.some((v) => v.volunteerId.toLowerCase() === newVolunteer.volunteerId.trim().toLowerCase());
    if (idExists) {
      toast.error('Volunteer ID already exists');
      return;
    }
    const emailExists = volunteers.some((v) => v.email.toLowerCase() === newVolunteer.email.trim().toLowerCase());
    if (emailExists) {
      toast.error('Email already exists');
      return;
    }
    const created: Volunteer = {
      id: Date.now(),
      volunteerId: newVolunteer.volunteerId.trim().toUpperCase(),
      name: newVolunteer.name.trim(),
      email: newVolunteer.email.trim().toLowerCase(),
      campus: newVolunteer.campus,
      status: 'active',
      lastSeen: 'Never',
      passwordLastUpdated: 'Today',
      mustChangePassword: true,
    };
    setVolunteers((prev) => [created, ...prev]);
    setNewVolunteer({ volunteerId: '', name: '', email: '', campus: 'Lagos Island' });
    toast.success(`✓ Volunteer ${created.name} created`);
  };

  const handleApproveRegistration = (request: RegistrationRequest) => {
    const nextVolunteerId = `VOL${String(volunteers.length + 1).padStart(3, '0')}`;
    const created: Volunteer = {
      id: Date.now(),
      volunteerId: nextVolunteerId,
      name: request.name,
      email: request.email,
      campus: request.campus,
      status: 'active',
      lastSeen: 'Never',
      passwordLastUpdated: 'Today',
      mustChangePassword: true,
    };
    setVolunteers((prev) => [created, ...prev]);
    setRegistrationRequests((prev) => prev.filter((item) => item.id !== request.id));
    toast.success(`${request.name} approved as ${nextVolunteerId}`);
  };

  const handleRejectRegistration = (requestId: number) => {
    const found = registrationRequests.find((item) => item.id === requestId);
    setRegistrationRequests((prev) => prev.filter((item) => item.id !== requestId));
    if (found) {
      toast.error(`${found.name} registration rejected`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <Toaster position="top-right" richColors />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-16">
          <AppNavbar ctaHref="/admin#/dashboard" />
        </div>

        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black mb-4">
            Volunteer Activity Records
          </h1>
          <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
            View and manage volunteer participation records. Click on any volunteer
            <br className="hidden sm:block" />
            to see their detailed activity history and session contributions.
          </p>
        </div>

        {registrationRequests.length > 0 && (
          <div className="mb-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-slate-700" />
              <h2 className="text-xl font-bold text-slate-900">Pending Registration Requests ({registrationRequests.length})</h2>
            </div>
            <div className="space-y-3">
              {registrationRequests.map((request) => (
                <div key={request.id} className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-slate-900 font-semibold">{request.name}</p>
                    <p className="text-slate-600 text-sm">{request.email} • {request.campus}</p>
                    <p className="text-slate-500 text-xs">Requested: {request.requestedAt}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveRegistration(request)}
                      className="rounded-lg bg-black hover:bg-gray-900 text-white px-4 py-2 text-sm font-semibold transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectRegistration(request.id)}
                      className="rounded-lg bg-slate-300 hover:bg-slate-400 text-slate-900 px-4 py-2 text-sm font-semibold transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-900">Create New Volunteer</h2>
          </div>
          <form onSubmit={handleCreateVolunteer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              required
              value={newVolunteer.volunteerId}
              onChange={(e) => setNewVolunteer((prev) => ({ ...prev, volunteerId: e.target.value }))}
              placeholder="Volunteer ID"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none transition-colors"
            />
            <input
              required
              value={newVolunteer.name}
              onChange={(e) => setNewVolunteer((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Full name"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none transition-colors"
            />
            <input
              required
              type="email"
              value={newVolunteer.email}
              onChange={(e) => setNewVolunteer((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Email"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none transition-colors"
            />
            <select
              value={newVolunteer.campus}
              onChange={(e) => setNewVolunteer((prev) => ({ ...prev, campus: e.target.value as 'Lagos Island' | 'Lagos Mainland' }))}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none transition-colors"
            >
              <option>Lagos Island</option>
              <option>Lagos Mainland</option>
            </select>
            <button
              type="submit"
              className="rounded-xl bg-black hover:bg-gray-900 text-white text-sm font-semibold px-4 py-3 transition-colors"
            >
              Create
            </button>
          </form>
        </div>

        <div className="mb-10">
          <input
            type="text"
            placeholder="Search volunteers by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 px-6 rounded-2xl border border-slate-300 bg-white text-center text-lg font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
          />
        </div>

        <div className="space-y-3 mb-12">
          {filteredVolunteers.map((volunteer) => {
            const activityStats = getActivityStats(volunteer.volunteerId);
            return (
              <div
                key={volunteer.id}
                onClick={() => setSelectedVolunteer(volunteer)}
                className="grid grid-cols-[56px_1fr_auto_auto] sm:grid-cols-[72px_minmax(200px,1fr)_120px_120px] items-center gap-4 sm:gap-6 bg-white border border-slate-200 rounded-2xl px-4 sm:px-8 py-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black flex items-center justify-center text-white font-bold text-xs">
                  {getInitials(volunteer.name)}
                </div>

                <div className="min-w-0">
                  <p className="text-lg font-semibold text-black leading-tight">{volunteer.name}</p>
                  <p className="text-sm text-slate-600">{volunteer.volunteerId} • {volunteer.campus}</p>
                </div>

                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">{activityStats.sessions}</p>
                  <p className="text-xs text-slate-500">Sessions</p>
                </div>

                <div className="text-center">
                  <p className="text-sm font-medium text-slate-900">{activityStats.lastActivity}</p>
                  <p className="text-xs text-slate-500">Last Active</p>
                </div>
              </div>
            );
          })}
        </div>

        {selectedVolunteer && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedVolunteer(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-black p-6 rounded-t-2xl relative">
                <button
                  onClick={() => setSelectedVolunteer(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-black text-lg font-bold">
                    {getInitials(selectedVolunteer.name)}
                  </div>
                  <div>
                    <h2 className="text-white mb-1 text-xl font-bold">
                      {selectedVolunteer.name}
                    </h2>
                    <p className="text-slate-300 font-bold uppercase text-xs tracking-widest">{selectedVolunteer.volunteerId}</p>
                    <p className="text-slate-400 text-sm">{selectedVolunteer.campus}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-slate-700" />
                  <h3 className="text-lg font-bold text-slate-900">Activity History</h3>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {getVolunteerActivity(selectedVolunteer.volunteerId).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <div>
                          <p className="font-semibold text-slate-900">{activity.date}</p>
                          <p className="text-sm text-slate-600">{activity.session} • {activity.details}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-800">
                        {activity.action}
                      </span>
                    </div>
                  ))}

                  {getVolunteerActivity(selectedVolunteer.volunteerId).length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-60" />
                      <p>No activity records found.</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Total Sessions</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {getActivityStats(selectedVolunteer.volunteerId).sessions}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-700">Last Activity</p>
                      <p className="text-lg font-bold text-slate-900">
                        {getActivityStats(selectedVolunteer.volunteerId).lastActivity}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
