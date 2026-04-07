import { createHashRouter } from 'react-router';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import IdCardCollection from './pages/IdCardCollection';
import AdminModulePage from './pages/AdminModulePage';
import VolunteerManagement from './pages/VolunteerManagement';
import StudentRecordsChoice from './pages/StudentRecordsChoice';
import Level1StudentManagement from './pages/Level1StudentManagement';
import Level2StudentManagement from './pages/Level2StudentManagement';

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
    element: <AdminModulePage title="Approvals Queue" description="Review and approve student registrations submitted by volunteers." />,
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
    element: <AdminModulePage title="CSV Import" description="Import students from CSV and review skipped records." />,
  },
  {
    path: '/reports',
    element: <AdminModulePage title="Reports" description="Generate session and summary reports with CSV export." />,
  },
  {
    path: '/volunteers',
    Component: VolunteerManagement,
  },
  {
    path: '/id-cards',
    Component: IdCardCollection,
  },
]);
