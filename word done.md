# Akal University Alumni Portal — Development Progress & Architecture

## Overview
The development of the **Akal University Alumni Portal** has been established following the SRS specifications and the official Akal University Design System (Prospectus 2026–27 visual identity: `#F9B900` Akal Yellow, `#087BB5` Akal Blue, `#172333` Dark Navy).

---

## 1. Backend Architecture (CodeIgniter 4 + MySQL)
- **Database**: `akal_alumni_portal` on MariaDB/MySQL.
- **Migrations**: Automated migration (`2026-10-08-000001_CreateAkalAlumniPortalTables.php`) creating 16 core relational tables:
  1. `users` (Role-based access: `public_visitor`, `student`, `alumni`, `admin`, `superadmin`)
  2. `alumni_profiles` (Verified alumni details, departments, batch years, company, bio, skills, mentorship status)
  3. `student_profiles` (Student career interests, enrollments, programs)
  4. `admin_profiles` (Admin designations and granular permissions)
  5. `events` (Homecoming, reunions, webinars, conferences, sports meets)
  6. `event_registrations` (Attendance, ticket counts, check-in tracking)
  7. `jobs` (Full-time, internships, remote career opportunities)
  8. `job_applications` (Direct applications tracking)
  9. `mentorship_programs` (1-on-1 alumni-student mentorship sessions)
  10. `chapters` (Bathinda, Delhi NCR, Bengaluru, Canada, UK regional hubs)
  11. `success_stories` (Featured alumni career journey spotlights)
  12. `news_announcements` (Pinned notices, awards, university updates)
  13. `gallery_albums` (Convocation, reunion, and campus life photo collections)
  14. `system_settings` (Super Admin database-driven portal toggles & metadata)
  15. `audit_logs` (Security & administrative audit trail)
  16. `alumni_id_cards` (Digital Alumni ID passes with QR verification payloads)
- **Database Seeder**: `AkalAlumniPortalSeeder` populated with Super Admin, Admin, Verified Alumni, Student accounts, events, jobs, stories, chapters, and initial configuration.
- **Authentication & Security**: JWT Service (`JwtService.php`), `AuthFilter.php` role-based protection, `ApiResponseTrait.php` standardized JSON envelope, and CORS configuration.
- **REST API Endpoints**:
  - `GET /api/public/*` (Stats, Settings, Alumni Directory, Events, Jobs, Chapters, Stories, News, Gallery)
  - `POST /api/auth/*` (Login, Register, Me)
  - `GET/PUT /api/alumni/*` (Profile, Digital ID, Jobs posting, Mentorship requests management)
  - `GET/POST /api/student/*` (Profile, Mentorship booking, Requests tracking)
  - `GET/POST /api/admin/*` (Dashboard KPIs, Verification queue approve/reject, User directory, Event publishing, System settings, Audit logs)

---

## 2. Frontend Architecture (React + Bootstrap 5 + Akal Design System)
- **Theme**: Custom `src/theme/akal-theme.css` with Akal University brand tokens, gradients, cards, and badges.
- **API Client**: `src/services/api.js` with Axios interceptors and Bearer token management.
- **Authentication & Persona Switcher**: `src/context/AuthContext.jsx` with 1-click quick testing for all 4 roles:
  1. **Super Admin**: `superadmin@akaluniversity.ac.in` (`Admin@12345`)
  2. **Alumni Admin**: `admin@akaluniversity.ac.in` (`Admin@12345`)
  3. **Verified Alumni (Google)**: `harpreet.tech@gmail.com` (`Alumni@12345`)
  4. **CS Student**: `student@akaluniversity.ac.in` (`Student@12345`)
- **Components & Layouts**:
  - `Navbar.jsx` (Akal University emblem, quick role switcher, notification badge, responsive navigation, and user avatar dropdown)
  - `Footer.jsx` (Institutional information, Talwandi Sabo address, quick links, and accreditation markers)
  - `AlumniCard.jsx` (Verified badge, distinguished status, company, designation, skills, and connect CTAs)
  - `DigitalIdModal.jsx` (Interactive official Digital Alumni ID Card with live QR code generation via `qrcode.react`)
- **Pages**:
  - `HomePage.jsx` (Hero with Akal branding, animated KPI counters, distinguished showcase, events preview, and CTAs)
  - `AlumniDirectoryPage.jsx` (Search, department & batch filters, mentor/distinguished filters, and modal)
  - `EventsPage.jsx` (Reunions, webinars, meetups, on-campus fairs, and registration)
  - `JobsPage.jsx` (Full-time, internship, and remote opportunity listings)
  - `MentorshipPage.jsx` (Mentor directory and 1-on-1 inquiry form)
  - `ChaptersPage.jsx` (Regional & international hub connectivity)
  - `StoriesPage.jsx` (Featured alumni journeys)
  - `NewsGalleryPage.jsx` (Announcements and campus photo albums)
  - `LoginPage.jsx` & `RegisterPage.jsx` (Authentication and verification notices)
  - `AlumniDashboard.jsx` (Profile editor, digital ID viewer, job poster, mentee manager)
  - `StudentDashboard.jsx` (Active mentorship manager, mentor discovery, profile editor)
  - `AdminDashboard.jsx` (Chart.js graphs, pending verification queue, user management, event publisher, system settings, and audit logs)

---

## 3. Running Dev Servers
- **Backend API**: `http://localhost:8080` (`php spark serve --port=8080`)
- **Frontend App**: `http://localhost:5173` (`npm run dev`)
