# Bible School Attendance System - Full Build Specification

## 1. Project Summary

This project is an offline-first attendance and student-record platform for Bible School Student Services.

It is designed for:
- Up to 800 students
- Up to 10 volunteers
- One campus
- Weekend attendance workflow (Saturday and Sunday)

The solution is split into separate web apps for clarity, speed, and role-based access control.

## 2. Product Goals

### Primary goals
- Fast attendance capture during weekend sessions
- Clean student records with attendance history
- Volunteer-assisted onboarding with admin approval
- Session-by-session report generation and CSV export
- Simple operations first, low-maintenance database

### UX goals
- Modern but calm interface
- Minimal friction for volunteers
- Readable dashboards for admin users
- Mobile-friendly volunteer flow

## 3. App Architecture (Multi-App)

The system is intentionally separated into 4 parts:

1. `backend`
- Node.js + Express API
- SQLite database (offline-first)
- Authentication, attendance, student records, reporting APIs

2. `frontend-volunteer`
- Volunteer portal
- Attendance capture, student submission, history view
- Read-only history, no direct record editing privileges

3. `frontend-admin`
- Admin portal
- Approval queue, student management, reporting, CSV export, ID card generation

4. `frontend-public`
- Public landing + knowledgebase
- Portal links and guidance content

## 4. Current Tech Stack

### Backend
- Node.js
- Express
- SQLite (`sqlite3`)
- JWT auth (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- CSV import parser (`csv-parser`)
- CSV export (`json2csv`)
- File upload (`multer`)

### Frontend
- React + Vite
- React Router
- Axios
- Tailwind utility base with custom design-token layer (volunteer UI)

## 5. Roles and Permissions

## 5.1 Admin
Admin can:
- Log in to admin portal
- View all students
- Approve/reject newly submitted students
- Import students from CSV
- Generate session reports
- Export session and summary reports as CSV
- View attendance histories
- Generate printable ID cards

Admin should own data governance and approval authority.

## 5.2 Volunteer
Volunteer can:
- Log in to volunteer portal
- Take attendance for active sessions
- Mark students present/absent
- Register new students (submitted to approval queue)
- View student attendance history (read-only)

Volunteer cannot:
- Directly modify historical records outside attendance capture flow
- Approve student registrations
- Access admin-only views

## 5.3 Public user
Public site provides:
- General product overview
- Knowledgebase information
- Entry links to volunteer/admin portals

## 6. Attendance Model

### Operational schedule
Saturday:
- Morning: 9:00 AM - 11:30 AM
- Afternoon: 1:40 PM - 2:20 PM
- Evening: 5:00 PM - 8:00 PM

Sunday:
- Afternoon: 1:00 PM - 2:20 PM
- Evening: 5:00 PM - 8:00 PM

### Current implementation
The database seeds 5 recurring session slots (3 Saturday + 2 Sunday) and logs attendance per date.

This means each attendance date uses one of these weekend session definitions.

### Reporting shape
Per-session attendance follows the expected binary structure:
- Student ID
- Session/date
- True/False (present/absent)
- Volunteer who recorded it

## 7. Database Design (SQLite)

Database file:
- `backend/db/attendance.db`

### 7.1 Tables

1. `students`
- `id` (PK)
- `student_id` (unique business ID)
- `name`
- `enrollment_date`
- `status`
- `initials`
- timestamps

2. `attendance_sessions`
- `id` (PK)
- `day`
- `session_name`
- `start_time`
- `end_time`
- `session_number`

3. `attendance`
- `id` (PK)
- `student_id` (FK by business ID)
- `session_id` (FK)
- `attendance_date`
- `present` (0/1)
- `volunteer_id`
- `recorded_at`
- unique constraint on (`student_id`, `session_id`, `attendance_date`)

4. `volunteers`
- volunteer identity and credentials

5. `admins`
- admin identity and credentials

6. `student_approvals`
- pending/approved/rejected queue
- who submitted and who approved

7. `audit_log`
- action tracking table scaffold for governance

### 7.2 Indexes
Indexes are configured on attendance and status fields to keep queries responsive.

## 8. API Surface (Implemented)

## 8.1 Auth routes
- `POST /api/auth/admin/login`
- `POST /api/auth/volunteer/login`
- `POST /api/auth/verify`

## 8.2 Student routes
- `GET /api/students`
- `GET /api/students/:student_id`
- `POST /api/students` (admin)
- `POST /api/students/import/csv` (admin)
- `GET /api/students/approvals/queue` (admin)
- `POST /api/students/approvals/:approval_id/approve` (admin)
- `POST /api/students/approvals/:approval_id/reject` (admin)

## 8.3 Attendance routes
- `GET /api/attendance/sessions`
- `POST /api/attendance/record`
- `GET /api/attendance/session/:session_id/:date`
- `POST /api/attendance/students/submit` (volunteer onboarding request)

## 8.4 Report routes
- `GET /api/reports/session/:session_id/:date`
- `GET /api/reports/session/:session_id/:date/export` (CSV)
- `GET /api/reports/student/:student_id`
- `GET /api/reports/summary/:date`
- `GET /api/reports/summary/:date/export` (CSV)

## 9. CSV Workflows

## 9.1 Import students (Admin)
Expected CSV headers:
- `student_id`
- `name`
- `enrollment_date`

System behavior:
- Inserts valid new students
- Skips invalid or duplicate records
- Returns imported/skipped counts and error list

## 9.2 Export reports (Admin)
Supported downloads:
- Session attendance CSV
- Daily summary CSV

## 10. ID Card Module (Current)

Admin can generate print-friendly ID cards from student list.

Current card structure includes:
- Student name
- Student ID
- Initials avatar
- Barcode text representation

Current state:
- Browser print layout is implemented
- Intended for physical-card printing pipeline

## 11. Frontend Modules

## 11.1 Volunteer portal
Main modules:
- Login
- Dashboard (session/date selection, quick check-in)
- Register student
- Attendance history

UI state:
- Recently upgraded with guide-based visual system
- Includes design tokens, badges, avatars, metric cards, quick check-in layout, and calmer interaction style

## 11.2 Admin portal
Main modules:
- Login
- Dashboard
- Approvals queue
- Student list
- CSV import
- Reports + CSV export
- ID card print
- Volunteer management placeholder screen

## 11.3 Public portal
Main modules:
- Landing page
- Feature blocks
- Knowledgebase entries
- Portal links

## 12. Security Model

Implemented security controls:
- JWT access token verification middleware
- Role checks for admin vs volunteer endpoints
- Password hashing with bcrypt
- Route-level authorization checks

Recommended hardening before production:
- Move secret keys to `.env`
- Add refresh-token strategy or shorter token lifetime
- Add request throttling and brute-force login protection
- Tighten CORS by domain

## 13. Offline-First Strategy

Current offline-first foundation:
- Local SQLite file database
- Local dev stack with no cloud dependency

Future improvements for stronger offline resilience:
- Frontend local queue for attendance actions during temporary API/server outages
- Sync status indicator for operator confidence
- Conflict handling policy for duplicate writes

## 14. Requirement Coverage Matrix

Requested capability vs status:

1. Scan attendance
- Status: Implemented (search-based quick check-in; can be extended to hardware barcode scan)

2. Student log and profile with attendance history
- Status: Implemented

3. ID collection/register module
- Status: Partially implemented (ID card generation and print present; dedicated issuance register can be added)

4. Report generation
- Status: Implemented (session view, summary view, CSV exports)

5. Register new student section
- Status: Implemented

6. Separate volunteer login section
- Status: Implemented with role-based portal and limits

7. Knowledgebase section
- Status: Implemented in public portal

8. Landing page with role login options and restricted volunteer capabilities
- Status: Implemented in architecture and role routing

9. Separate app areas/subdomains pattern
- Status: Implemented as separate local apps; ready to map to subdomains on deployment

## 15. Deployment Mapping Plan

Suggested domain mapping after go-live:
- `admin.studentservices.yourdomain` -> admin frontend
- `attendance.studentservices.yourdomain` -> volunteer frontend
- `studentservices.yourdomain` -> public frontend
- backend API behind `api.studentservices.yourdomain` or private gateway

## 16. Known Gaps and Next Build Items

1. Dedicated ID issuance register log
- Add table: `id_issuance_log` with issue date, issuer, student, status

2. Barcode scanning input mode
- Add camera/USB scanner-friendly capture in volunteer dashboard

3. Volunteer management completion
- Replace current admin placeholder with create/deactivate/reset flows

4. Audit trail activation
- Write all critical actions to `audit_log`

5. Environment configuration
- Add `.env` usage and production-safe secrets

6. Test coverage
- Add route-level tests (auth, attendance record, CSV import/export)

## 17. Local Runbook

1. Install dependencies in all project folders
2. Run database init script
3. Start backend and each frontend app in separate terminals
4. Access:
- Public: `http://localhost:3000`
- Volunteer: `http://localhost:3001`
- Admin: `http://localhost:3002`
- API: `http://localhost:5000`

Demo credentials:
- Admin: `ADMIN001 / admin123`
- Volunteer: `VOL001 / volunteer123`

## 18. Delivery Position

The platform is now in a usable MVP state for offline-first operations with role-separated portals and CSV reporting.

It is suitable for internal project completion milestones and user testing with student services workflow teams.

---

Prepared for: Student Services Team
Project type: Bible School Attendance and Records Platform
Version context: Local MVP build (offline-first)
Date: April 5, 2026
