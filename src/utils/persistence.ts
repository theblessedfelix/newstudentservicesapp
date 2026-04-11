/**
 * Data Persistence Layer
 * Handles IndexedDB and localStorage for storing application data
 */

const DB_NAME = 'StudentVolunteerDB';
const DB_VERSION = 1;

const STORES = {
  STUDENTS: 'students',
  VOLUNTEERS: 'volunteers',
  APPROVALS: 'approvals',
  ATTENDANCE: 'attendance',
};

interface Student {
  id: number;
  studentId: string;
  name: string;
  email: string;
  campus: 'Lagos Island' | 'Lagos Mainland';
  level: 'Level 1' | 'Level 2';
  enrollmentDate: string;
}

interface Volunteer {
  id: number;
  volunteerId: string;
  name: string;
  email: string;
  campus: 'Lagos Island' | 'Lagos Mainland';
  status: 'active' | 'inactive';
  lastSeen: string;
  passwordLastUpdated: string;
  mustChangePassword: boolean;
}

interface ApprovalRequest {
  id: number;
  studentId: string;
  name: string;
  email: string;
  campus: 'Lagos Island' | 'Lagos Mainland';
  level: 'Level 1' | 'Level 2';
  parentGuardian: string;
  parentPhone: string;
  notes: string;
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface AttendanceRecord {
  id: number;
  studentId: string;
  date: string;
  session: string;
  status: 'present' | 'absent';
  volunteer: string;
  volunteerId: string;
}

let dbInstance: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create Students store
      if (!db.objectStoreNames.contains(STORES.STUDENTS)) {
        const studentStore = db.createObjectStore(STORES.STUDENTS, { keyPath: 'id' });
        studentStore.createIndex('studentId', 'studentId', { unique: true });
        studentStore.createIndex('level', 'level', { unique: false });
      }

      // Create Volunteers store
      if (!db.objectStoreNames.contains(STORES.VOLUNTEERS)) {
        const volunteerStore = db.createObjectStore(STORES.VOLUNTEERS, { keyPath: 'id' });
        volunteerStore.createIndex('volunteerId', 'volunteerId', { unique: true });
        volunteerStore.createIndex('status', 'status', { unique: false });
      }

      // Create Approvals store
      if (!db.objectStoreNames.contains(STORES.APPROVALS)) {
        const approvalsStore = db.createObjectStore(STORES.APPROVALS, { keyPath: 'id' });
        approvalsStore.createIndex('status', 'status', { unique: false });
      }

      // Create Attendance store
      if (!db.objectStoreNames.contains(STORES.ATTENDANCE)) {
        const attendanceStore = db.createObjectStore(STORES.ATTENDANCE, { keyPath: 'id' });
        attendanceStore.createIndex('studentId', 'studentId', { unique: false });
        attendanceStore.createIndex('date', 'date', { unique: false });
      }
    };
  });
};

// STUDENTS
export const saveStudent = async (student: Student): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.STUDENTS], 'readwrite');
    const store = transaction.objectStore(STORES.STUDENTS);
    const request = store.put(student);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const getStudent = async (id: number): Promise<Student | undefined> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.STUDENTS], 'readonly');
    const store = transaction.objectStore(STORES.STUDENTS);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const getAllStudents = async (): Promise<Student[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.STUDENTS], 'readonly');
    const store = transaction.objectStore(STORES.STUDENTS);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const getStudentsByLevel = async (level: 'Level 1' | 'Level 2'): Promise<Student[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.STUDENTS], 'readonly');
    const store = transaction.objectStore(STORES.STUDENTS);
    const index = store.index('level');
    const request = index.getAll(level);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const deleteStudent = async (id: number): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.STUDENTS], 'readwrite');
    const store = transaction.objectStore(STORES.STUDENTS);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// VOLUNTEERS
export const saveVolunteer = async (volunteer: Volunteer): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.VOLUNTEERS], 'readwrite');
    const store = transaction.objectStore(STORES.VOLUNTEERS);
    const request = store.put(volunteer);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const getAllVolunteers = async (): Promise<Volunteer[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.VOLUNTEERS], 'readonly');
    const store = transaction.objectStore(STORES.VOLUNTEERS);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const deleteVolunteer = async (id: number): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.VOLUNTEERS], 'readwrite');
    const store = transaction.objectStore(STORES.VOLUNTEERS);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// APPROVALS
export const saveApprovalRequest = async (approval: ApprovalRequest): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.APPROVALS], 'readwrite');
    const store = transaction.objectStore(STORES.APPROVALS);
    const request = store.put(approval);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const getAllApprovals = async (): Promise<ApprovalRequest[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.APPROVALS], 'readonly');
    const store = transaction.objectStore(STORES.APPROVALS);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const getPendingApprovals = async (): Promise<ApprovalRequest[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.APPROVALS], 'readonly');
    const store = transaction.objectStore(STORES.APPROVALS);
    const index = store.index('status');
    const request = index.getAll('pending');

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const deleteApprovalRequest = async (id: number): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.APPROVALS], 'readwrite');
    const store = transaction.objectStore(STORES.APPROVALS);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// ATTENDANCE
export const saveAttendanceRecord = async (record: AttendanceRecord): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ATTENDANCE], 'readwrite');
    const store = transaction.objectStore(STORES.ATTENDANCE);
    const request = store.put(record);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const getAttendanceByStudent = async (studentId: string): Promise<AttendanceRecord[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ATTENDANCE], 'readonly');
    const store = transaction.objectStore(STORES.ATTENDANCE);
    const index = store.index('studentId');
    const request = index.getAll(studentId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const getAttendanceByDate = async (date: string): Promise<AttendanceRecord[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ATTENDANCE], 'readonly');
    const store = transaction.objectStore(STORES.ATTENDANCE);
    const index = store.index('date');
    const request = index.getAll(date);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const getAllAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ATTENDANCE], 'readonly');
    const store = transaction.objectStore(STORES.ATTENDANCE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

// SYNC WITH LOCALSTORAGE FOR SETTINGS
export const saveAppSetting = (key: string, value: any): void => {
  localStorage.setItem(`app_setting_${key}`, JSON.stringify(value));
};

export const getAppSetting = (key: string, defaultValue?: any): any => {
  const stored = localStorage.getItem(`app_setting_${key}`);
  return stored ? JSON.parse(stored) : defaultValue;
};

export const deleteAppSetting = (key: string): void => {
  localStorage.removeItem(`app_setting_${key}`);
};

// CLEAR ALL DATA (use with caution)
export const clearAllData = async (): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const stores = Object.values(STORES);
    let completed = 0;

    stores.forEach((storeName) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        completed++;
        if (completed === stores.length) {
          resolve();
        }
      };
    });
  });
};

export default {
  saveStudent,
  getStudent,
  getAllStudents,
  getStudentsByLevel,
  deleteStudent,
  saveVolunteer,
  getAllVolunteers,
  deleteVolunteer,
  saveApprovalRequest,
  getAllApprovals,
  getPendingApprovals,
  deleteApprovalRequest,
  saveAttendanceRecord,
  getAttendanceByStudent,
  getAttendanceByDate,
  saveAppSetting,
  getAppSetting,
  deleteAppSetting,
  clearAllData,
};
