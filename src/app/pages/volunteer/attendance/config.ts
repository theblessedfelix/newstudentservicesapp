import { getLevel1ScannerStudents } from '../../../data/level1StudentRegistry';
import { getLevel2ScannerStudents } from '../../../data/level2StudentRegistry';

export type AttendanceLevelId = 'Level 1' | 'Level 2';
export type AttendanceDayId = 'Day 1' | 'Day 2';
export type DayOfWeek = 'Saturday' | 'Sunday';

export interface AttendanceStudent {
  id: string;
  name: string;
  studentId: string;
  initials: string;
}

export interface AttendanceSession {
  name: string;
  time: string;
  description: string;
  spanFullRow?: boolean;
  startTime?: string;
  endTime?: string;
}

export interface AttendanceDayConfig {
  id: AttendanceDayId;
  label: string;
  description: string;
  dayOfWeek: DayOfWeek;
  sessionVariant: 'grid' | 'feature';
  sessionGridClass: string;
  sessions: AttendanceSession[];
}

export interface AttendanceLevelConfig {
  id: AttendanceLevelId;
  shortLabel: string;
  cardTitle: string;
  cardDescription: [string, string];
  cardVariant: 'centered' | 'editorial';
  getStudents: () => AttendanceStudent[];
  days: AttendanceDayConfig[];
}

const level2Students: AttendanceStudent[] = getLevel2ScannerStudents();

// Utility to parse time strings like "9:00 AM" to minutes since midnight
function parseTimeToMinutes(timeStr: string): number {
  const [time, period] = timeStr.trim().split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

// Check if current time is within session window
export function isSessionActive(session: AttendanceSession): boolean {
  if (!session.startTime || !session.endTime) return true; // No time restriction
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const start = parseTimeToMinutes(session.startTime);
  const end = parseTimeToMinutes(session.endTime);
  return currentMinutes >= start && currentMinutes <= end;
}

// Get minutes remaining in session; returns -1 if session is over
export function getSessionTimeRemaining(session: AttendanceSession): number {
  if (!session.endTime) return Infinity;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const end = parseTimeToMinutes(session.endTime);
  const remaining = end - currentMinutes;
  return remaining > 0 ? remaining : -1;
}

const day1SessionsLevel1: AttendanceSession[] = [
  {
    name: 'Morning sign in',
    time: '9:00 AM - 11:30 AM',
    startTime: '9:00 AM',
    endTime: '11:30 AM',
    description: 'Use this for the first attendance check-in window at the start of the day.',
  },
  {
    name: 'Afternoon sign in',
    time: '1:30 PM - 2:50 PM',
    startTime: '1:30 PM',
    endTime: '2:50 PM',
    description: 'Track the afternoon attendance window for Level 1 students and volunteers.',
  },
  {
    name: 'Signout',
    time: '5:30 PM - 8:00 PM',
    startTime: '5:30 PM',
    endTime: '8:00 PM',
    description: 'Use this when students are signing out after the final session wrap-up.',
    spanFullRow: true,
  },
];

const day2SessionsLevel1: AttendanceSession[] = [
  {
    name: 'Afternoon sign in',
    time: '1:30 PM - 2:50 PM',
    startTime: '1:30 PM',
    endTime: '2:50 PM',
    description: 'Track day 2 afternoon attendance for Level 1 students and volunteers.',
  },
  {
    name: 'Signout',
    time: '5:30 PM - 8:00 PM',
    startTime: '5:30 PM',
    endTime: '8:00 PM',
    description: 'Use this for day 2 signout and closeout checks.',
    spanFullRow: true,
  },
];

const day1SessionsLevel2: AttendanceSession[] = [
  {
    name: 'Morning sign in',
    time: '9:00 AM - 11:30 AM',
    startTime: '9:00 AM',
    endTime: '11:30 AM',
    description: 'Morning attendance check-in for Level 2 students.',
  },
  {
    name: 'Afternoon',
    time: '1:30 PM - 2:30 PM',
    startTime: '1:30 PM',
    endTime: '2:30 PM',
    description: 'Use this focused attendance block for the Level 2 afternoon sign-in window.',
  },
  {
    name: 'Signout',
    time: '5:30 PM - 8:00 PM',
    startTime: '5:30 PM',
    endTime: '8:00 PM',
    description: 'Use this for Level 2 student signout during the evening closeout window.',
    spanFullRow: true,
  },
];

const day2SessionsLevel2: AttendanceSession[] = [
  {
    name: 'Afternoon',
    time: '1:30 PM - 2:30 PM',
    startTime: '1:30 PM',
    endTime: '2:30 PM',
    description: 'Day 2 afternoon attendance for Level 2 students.',
  },
  {
    name: 'Signout',
    time: '5:30 PM - 8:00 PM',
    startTime: '5:30 PM',
    endTime: '8:00 PM',
    description: 'Day 2 signout and closeout for Level 2 students.',
    spanFullRow: true,
  },
];

export const ATTENDANCE_LEVELS: AttendanceLevelConfig[] = [
  {
    id: 'Level 1',
    shortLabel: 'L1',
    cardTitle: 'Level 1 Sessions',
    cardDescription: ['Take attendance, register', 'students, and view records'],
    cardVariant: 'centered',
    getStudents: () => getLevel1ScannerStudents(),
    days: [
      {
        id: 'Day 1',
        label: 'Day 1 Attendance',
        description: 'Saturday - Morning, afternoon, and signout attendance flow.',
        dayOfWeek: 'Saturday',
        sessionVariant: 'feature',
        sessionGridClass: 'md:grid-cols-1 md:max-w-2xl md:mx-auto',
        sessions: day1SessionsLevel1,
      },
      {
        id: 'Day 2',
        label: 'Day 2 Attendance',
        description: 'Sunday - Afternoon and signout attendance flow.',
        dayOfWeek: 'Sunday',
        sessionVariant: 'feature',
        sessionGridClass: 'md:grid-cols-1 md:max-w-2xl md:mx-auto',
        sessions: day2SessionsLevel1,
      },
    ],
  },
  {
    id: 'Level 2',
    shortLabel: 'L2',
    cardTitle: 'Level 2 Sessions',
    cardDescription: ['Manage advanced cohorts with', 'focused attendance and records'],
    cardVariant: 'editorial',
    getStudents: () => level2Students,
    days: [
      {
        id: 'Day 1',
        label: 'Day 1 Attendance',
        description: 'Saturday - Morning, afternoon, and signout attendance flow.',
        dayOfWeek: 'Saturday',
        sessionVariant: 'feature',
        sessionGridClass: 'md:grid-cols-1 md:max-w-2xl md:mx-auto',
        sessions: day1SessionsLevel2,
      },
      {
        id: 'Day 2',
        label: 'Day 2 Attendance',
        description: 'Sunday - Afternoon and signout attendance flow.',
        dayOfWeek: 'Sunday',
        sessionVariant: 'feature',
        sessionGridClass: 'md:grid-cols-1 md:max-w-2xl md:mx-auto',
        sessions: day2SessionsLevel2,
      },
    ],
  },
];

export const ATTENDANCE_LEVEL_MAP = ATTENDANCE_LEVELS.reduce(
  (map, level) => {
    map[level.id] = level;
    return map;
  },
  {} as Record<AttendanceLevelId, AttendanceLevelConfig>,
);
