import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/LandingPage";
import VolunteerLogin from "./pages/volunteer/VolunteerLogin";
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import TakeAttendance from "./pages/volunteer/TakeAttendance";
import RegisterStudent from "./pages/volunteer/RegisterStudent";
import ViewHistory from "./pages/volunteer/ViewHistory";
import Level1Sessions from "./pages/volunteer/Level1Sessions";
import Level2Sessions from "./pages/volunteer/Level2Sessions";
import StudentRecordsChoice from "./pages/volunteer/StudentRecordsChoice";
import AttendancePortal from "./pages/AttendancePortal";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/attendance-portal",
    Component: AttendancePortal,
  },
  {
    path: "/volunteer",
    children: [
      { index: true, Component: VolunteerLogin },
      { path: "dashboard", Component: VolunteerDashboard },
      { path: "attendance", Component: TakeAttendance },
      { path: "level-1", Component: Level1Sessions },
      { path: "level-2", Component: Level2Sessions },
      { path: "student-records-choice", Component: StudentRecordsChoice },
      { path: "register", Component: RegisterStudent },
      { path: "history", Component: ViewHistory },
    ],
  },
]);
