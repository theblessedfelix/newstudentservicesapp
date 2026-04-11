import { createHashRouter } from 'react-router';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import IdCardCollection from './pages/IdCardCollection';
import AdminModulePage from './pages/AdminModulePage';
import ApprovalsQueue from './pages/ApprovalsQueue';
import ExceptionQueue from './pages/ExceptionQueue';
import CsvImport from './pages/CsvImport';
import Reports from './pages/Reports';
import VolunteerManagement from './pages/VolunteerManagement';
import StudentRecordsChoice from './pages/StudentRecordsChoice';
import Level1StudentManagement from './pages/Level1StudentManagement';
import Level2StudentManagement from './pages/Level2StudentManagement';
import SessionManagement from './pages/SessionManagement';

export const router = createHashRouter([
  {
    path: '/',
    Component: AdminLogin,
  },
  {
    path: '/dashboard',
    Component: AdminDashboard,
  },
  {
    path: '/approvals',
    Component: ApprovalsQueue,
  },
  {
    path: '/exceptions',
    Component: ExceptionQueue,
  },
  {
    path: '/students',
    Component: StudentRecordsChoice,
  },
  {
    path: '/students/level-1',
    Component: Level1StudentManagement,
  },
  {
    path: '/students/level-2',
    Component: Level2StudentManagement,
  },
  {
    path: '/import',
    Component: CsvImport,
  },
  {
    path: '/reports',
    Component: Reports,
  },
  {
    path: '/volunteers',
    Component: VolunteerManagement,
  },
  {
    path: '/id-cards',
    Component: IdCardCollection,
  },
  {
    path: '/sessions',
    Component: SessionManagement,
  },
]);
