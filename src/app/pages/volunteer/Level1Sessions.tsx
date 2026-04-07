import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, Sun, Moon, Clock, ChevronRight } from 'lucide-react';

const SESSIONS = [
  { id: 1, day: 'Saturday', name: 'Morning Session', time: '9:00 AM - 11:30 AM' },
  { id: 2, day: 'Saturday', name: 'Afternoon Session', time: '1:40 PM - 2:20 PM' },
  { id: 3, day: 'Saturday', name: 'Evening Session', time: '5:00 PM - 8:00 PM' },
  { id: 4, day: 'Sunday', name: 'Afternoon Session', time: '1:00 PM - 2:20 PM' },
  { id: 5, day: 'Sunday', name: 'Evening Session', time: '5:00 PM - 8:00 PM' },
];

export default function Level1Sessions() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);

  const sections = ['Saturday', 'Sunday'];

  // Helper to get theme-specific classes
  const theme = {
    bg: isDarkMode ? 'bg-gray-900' : 'bg-white',
    card: isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300',
    textMain: isDarkMode ? 'text-white' : 'text-gray-900',
    textMuted: isDarkMode ? 'text-gray-400' : 'text-gray-600',
    header: isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200',
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme.bg}`}>
      {/* Optimized Header */}
      <header className={`sticky top-0 z-20 backdrop-blur-md border-b ${theme.header}`}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/volunteer/dashboard')}
              className={`p-2.5 rounded-xl transition-all active:scale-95 ${
                isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 shadow-sm border border-gray-200 text-gray-600'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className={`text-xl font-bold tracking-tight ${theme.textMain}`}>Level 1 Sessions</h1>
              <p className={`text-xs font-medium uppercase tracking-wider ${theme.textMuted}`}>Select a time slot</p>
            </div>
          </div>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2.5 rounded-xl transition-all duration-300 ${
              isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {sections.map((day) => (
          <section key={day} className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`h-6 w-1 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded-full`} />
              <h2 className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {day} Schedule
              </h2>
            </div>

            <div className="grid gap-4">
              {SESSIONS.filter(s => s.day === day).map((session) => (
                <button
                  key={session.id}
                  onClick={() => navigate('/volunteer/attendance', { state: { session, level: 'Level 1' } })}
                  className={`group relative flex items-center justify-between p-5 border-2 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${theme.card}`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`hidden sm:flex w-12 h-12 rounded-2xl items-center justify-center transition-colors shadow-inner ${
                      isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}>
                      <Calendar className="w-6 h-6" />
                    </div>
                    
                    <div className="text-left">
                      <h3 className={`text-lg font-bold ${theme.textMain} transition-colors`}>
                        {session.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className={`w-3.5 h-3.5 ${theme.textMuted}`} />
                        <span className={`text-sm font-medium ${theme.textMuted}`}>
                          {session.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Subtle Footer info */}
      <footer className="max-w-4xl mx-auto px-4 pb-12 text-center">
        <p className={`text-xs ${theme.textMuted}`}>
          Can't find your session? Contact your coordinator.
        </p>
      </footer>
    </div>
  );
}