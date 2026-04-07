import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, Sun, Moon, Clock, ChevronRight } from 'lucide-react';

const SESSIONS = [
  { id: 1, day: 'Saturday', name: 'Saturday Morning', time: '9:00 AM - 11:30 AM' },
  { id: 2, day: 'Saturday', name: 'Saturday Afternoon', time: '1:40 PM - 2:20 PM' },
  { id: 3, day: 'Saturday', name: 'Saturday Evening', time: '5:00 PM - 8:00 PM' },
  { id: 4, day: 'Sunday', name: 'Sunday Afternoon', time: '1:00 PM - 2:20 PM' },
  { id: 5, day: 'Sunday', name: 'Sunday Evening', time: '5:00 PM - 8:00 PM' },
];

export default function Level2Sessions() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Grouping sessions logic
  const days = ['Saturday', 'Sunday'];

  const theme = {
    bg: isDarkMode ? 'bg-gray-900' : 'bg-white',
    header: isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200',
    card: isDarkMode 
      ? 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:bg-gray-800' 
      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md',
    textMain: isDarkMode ? 'text-white' : 'text-gray-900',
    textMuted: isDarkMode ? 'text-gray-400' : 'text-gray-600',
    accent: 'text-gray-700',
    iconBg: isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.bg}`}>
      {/* Sticky Glass Header */}
      <header className={`sticky top-0 z-20 backdrop-blur-md border-b ${theme.header}`}>
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/volunteer/dashboard')}
                className={`p-2.5 rounded-xl transition-all active:scale-90 ${
                  isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className={`text-xl font-extrabold tracking-tight ${theme.textMain}`}>
                  Level 2 Sessions
                </h1>
                <p className={`text-xs font-medium uppercase tracking-wider ${theme.textMuted}`}>
                  Select your weekend slot
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-xl transition-transform active:rotate-12 ${
                isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 space-y-12">
        {days.map((day) => (
          <section key={day} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2 mb-6">
              <div className={`h-2 w-2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-400'}`} />
              <h2 className={`text-sm font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {day} Sessions
              </h2>
            </div>

            <div className="grid gap-4">
              {SESSIONS.filter(s => s.name.startsWith(day)).map((session) => (
                <button
                  key={session.id}
                  onClick={() => navigate('/volunteer/attendance', { state: { session, level: 'Level 2' } })}
                  className={`group relative flex items-center justify-between p-5 border-2 rounded-2xl transition-all duration-300 ${theme.card}`}
                >
                  <div className="flex items-center gap-5">
                    {/* Icon Container */}
                    <div className={`flex w-12 h-12 rounded-2xl items-center justify-center transition-transform group-hover:scale-110 ${theme.iconBg}`}>
                      <Calendar className="w-6 h-6" />
                    </div>
                    
                    <div className="text-left">
                      <h3 className={`text-lg font-bold ${theme.textMain} transition-colors`}>
                        {session.name.replace(day, '').trim() || day}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className={`w-3.5 h-3.5 ${theme.textMuted}`} />
                        <span className={`text-sm font-medium ${theme.textMuted}`}>
                          {session.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-2 rounded-lg transition-all transform opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 ${theme.accent}`}>
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="max-w-4xl mx-auto px-4 pb-12 text-center">
        <div className={`h-px w-16 mx-auto mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
        <p className={`text-xs font-medium ${theme.textMuted}`}>
          Choose the session you are assigned to.
        </p>
      </footer>
    </div>
  );
}