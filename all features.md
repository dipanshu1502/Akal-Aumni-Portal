# Akal University Alumni Portal — All Features (Complete List)

> This document lists **every feature** implemented in the Akal University Alumni Portal project
> (Backend: CodeIgniter 4 + MySQL | Frontend: React + Bootstrap 5).
> Features are mapped to SRS requirement IDs (FR-01 → FR-20) wherever applicable.

---

## 1. User Roles & Access Control (FR-03, FR-04)

| Role | Access |
|------|--------|
| `public_visitor` | Browse approved public content without login |
| `student` | Student dashboard, mentorship requests, profile |
| `alumni` | Alumni dashboard, digital ID, job posting, mentoring |
| `admin` | Content management, verification, user management, reports |
| `superadmin` | Everything + system settings, module toggles, admin management |

- JWT-based authentication (`JwtService.php`) with role-aware `AuthFilter` route protection.
- Passwords hashed; account status checks (pending / approved / rejected / inactive) on login.
- Rejected/inactive users are blocked from authenticated features.
- One-click **Demo Persona Switcher** in the Navbar for quick testing of all 4 roles.

---

## 2. Public (Guest) Features — No Login Required

### 2.1 Home Page (`/`)
- Hero section with Akal branding and Super Admin–editable headline/subtext (Homepage Hero Customizer).
- Animated live KPI counters (alumni count, students, events, jobs, chapters).
- Announcement / top banner bar (badge + text, toggleable).
- Distinguished alumni showcase, events preview, success story highlights.
- Stats fetched from `GET /api/public/stats`.

### 2.2 Alumni Directory (`/directory`) — FR-05, FR-07
- Search by name, company, skills.
- Filters: department, batch/graduation year, mentor availability, distinguished status.
- Alumni cards with verified badge, designation, location, skills.
- Detail modal with privacy-safe field-level visibility (FR-19).
- Pagination via `GET /api/public/alumni`.

### 2.3 Events (`/events`) — FR-08
- Category filter chips: All / Reunion / Webinar / Meetup-Conference.
- Event cards: type, date, location, virtual/in-person, capacity.
- Event detail view with registration CTA.

### 2.4 Job Board (`/jobs`) — FR-10
- Full-time, internship, and remote opportunity listings.
- Filters by job type and location; apply CTA for logged-in users.

### 2.5 Mentorship Hub (`/mentorship`) — FR-11
- Mentor directory (alumni who opted into mentoring).
- Mentor detail + 1-on-1 inquiry request form (requires login; student role).

### 2.6 Chapters (`/chapters`) — FR-12
- Regional & international chapter hubs (Bathinda, Delhi NCR, Bengaluru, Canada, UK).

### 2.7 Success Stories (`/stories`) — FR-13
- Featured alumni career journey spotlights with category tags.

### 2.8 News & Gallery (`/news-gallery`) — FR-13
- News/announcements list with pinned notices, awards, university updates.
- Photo gallery albums (Convocation, Reunion, Campus Life).

### 2.9 Public Settings & Feature Visibility
- `GET /api/public/settings` drives **database-driven module visibility**:
  `enable_public_directory`, `enable_public_jobs`, `enable_public_events`,
  `enable_public_stories`, `enable_public_mentorship`, `enable_public_chapters`,
  `enable_public_gallery`.
- Navbar and Footer links auto-hide when a module is disabled by the Super Admin.

---

## 3. Authentication Features (FR-01, FR-03)

- **Login** (`/login`) — email + password, JWT issued on success.
- **Registration** (`/register`) — alumni/student signup with role selection plus **every** degree/programme the user has completed or is pursuing at Akal University (UG, PG, PhD, Diploma — degree, department, specialization, enrollment no, years, CGPA, thesis title). Stored in `user_educations`; the highest degree becomes the primary profile degree; account enters *pending verification* status.
- **Session restore** — token persisted in `localStorage` (`akal_token`), `GET /api/auth/me` restores session.
- **Logout** — clears token and state.
- **Quick demo login** for all 4 seeded accounts.

---



## 4. Alumni Dashboard (`/alumni/dashboard`)

### 4.1 Profile Editor (FR-06)
- Edit personal details, bio, company, designation, location, skills, mentorship availability.
- Saved via `PUT /api/alumni/profile`.

### 4.2 Digital Alumni ID (FR-15, FR-16)
- Interactive official Digital Alumni ID card modal.
- **Live QR code generation** (`qrcode.react`) with verification payload.
- Download/print ID; public QR verification does not expose private data.

### 4.3 Mentorship Management (FR-11)
- View incoming student mentorship inquiries.
- Approve / decline / update request status (`PUT /api/alumni/mentorship-requests/{id}`).
- Triggers a notification to the requesting student.

### 4.4 Job Posting (FR-10)
- Post career opportunities for alumni & students (`POST /api/alumni/jobs`).

---

## 5. Student Dashboard (`/student/dashboard`)

- **Profile editor** — career interests, program, enrollment (`PUT /api/student/profile`).
- **Mentor discovery** — browse mentors and send mentorship requests.
- **My Mentorships** — track active/pending mentorship requests (`GET /api/student/my-mentorships`).
- Notification sent to mentor on each new request (FR-14).

---

## 6. Admin / Super Admin Dashboard (`/admin/dashboard`)

### 6.1 Analytics & Reports (FR-17)
- KPI cards (total alumni, students, events, jobs, pending verifications).
- **Chart.js** graphs — e.g., alumni distribution by department.
- Report views for approved data.

### 6.2 Verification Queue (FR-02)
- Pending alumni registration list.
- **Approve / Reject** actions with reason.
- Writes an approval notification to the alumni user.

### 6.3 User Management (FR-04)
- Full user directory with search.
- Change user **role** (`PUT /api/admin/users/{id}/role`).
- Change user **status** — active/inactive/approved/rejected (`PUT /api/admin/users/{id}/status`).

### 6.4 CMS Modules (FR-08, FR-10, FR-13)
- **Stories CMS** — create / edit / delete success stories.
- **News CMS** — create / edit / delete announcements (pin support).
- **Events CMS** — create / edit / delete & publish events.
- **Jobs CMS** — create / edit / delete job listings.
- **Chapters CMS** — create / edit / delete regional chapters.
- **Gallery CMS** — create / edit / delete photo albums.

### 6.5 System Settings — Super Admin (Super Admin Control Model)
Database-driven settings editor with grouped categories:
- 🎨 **Branding & Identity** — logo, name, colors.
- 📢 **Announcement Banner** — top bar badge & text, toggle.
- 🚀 **Homepage Hero Customizer** — hero headline/subtext/CTA.
- 📊 **Key Statistics & Counters** — editable KPI values.
- 📞 **Contacts & Campus Info** — address, phone, email.
- 🌐 **Social Links & Handles**.
- 🏛️ **Footer & Accreditation**.
- ⚙️ **Module Visibility & Rules** — enable/disable every public module.
- ➕ **Custom Parameters** — add/delete arbitrary key-value settings.
- Endpoints: `GET/POST /api/admin/settings`, `POST /api/admin/settings/custom`, `DELETE /api/admin/settings/{key}`.

### 6.6 Audit Logs (FR-18)
- Chronological trail of critical administrative actions with actor email.
- Fetched from `GET /api/admin/audit-logs`.

---

## 7. Notifications (FR-14)

- `notifications` table stores in-app notifications (title, message, type, read state).
- Generated on: alumni verification approval, new mentorship request, and related events.
- Notification badge in the Navbar.

---

## 8. Backend / API Features (FR-20)

- **REST API** under `/api` with a standardized JSON envelope (`ApiResponseTrait`).
- **Route groups**:
  - `GET /api/public/*` — settings, stats, alumni (+detail), events, jobs, chapters, stories, news, gallery.
  - `POST /api/auth/*` — login, register, `GET /api/auth/me`.
  - `/api/alumni/*` (filter: `auth:alumni`) — profile, id-card, jobs, mentorship-requests.
  - `/api/student/*` (filter: `auth:student`) — profile, mentorship-request, my-mentorships.
  - `/api/admin/*` (filter: `auth:admin,superadmin`) — dashboard, verifications, users, events, settings, stories, news, chapters, jobs, gallery, audit-logs.
- **CORS** preflight handler for all API OPTIONS requests.
- **Migrations** — automated migration creating 17 relational tables:
  `users`, `alumni_profiles`, `student_profiles`, `admin_profiles`, `events`,
  `event_registrations`, `jobs`, `job_applications`, `mentorship_programs`,
  `chapters`, `success_stories`, `news_announcements`, `gallery_albums`,
  `system_settings`, `audit_logs`, `notifications`, `alumni_id_cards`.
- **Seeder** (`AkalAlumniPortalSeeder`) — demo accounts, settings, events, jobs, stories, chapters, news.

---

## 9. Security Features

- JWT authentication with Bearer-token Axios interceptors (`src/services/api.js`).
- Role-based route filters (`auth:alumni`, `auth:student`, `auth:admin,superadmin`).
- Hashed passwords; 401 auto-redirect to login on token expiry.
- Field-level privacy rules on public alumni data (FR-19).
- Audit logging of admin actions (FR-18).
- Input validation and sanitized error responses (no DB credentials / stack traces leaked).

---

## 10. Design & UX Features

- **Akal Design System** — Prospectus 2026–27 identity:
  Akal Yellow `#F9B900`, Akal Blue `#087BB5`, Dark Navy `#172333`.
- Custom theme: `src/theme/akal-theme.css` (brand tokens, gradients, cards, badges, chips).
- Fully responsive Bootstrap 5 layout (mobile-first navbar, footer, dashboards).
- Lucide icons, Chart.js visualizations, toast/alert feedback.
- Common components: `Navbar.jsx`, `Footer.jsx`, `AlumniCard.jsx`, `DigitalIdModal.jsx`.

---

## 11. SRS Requirement Coverage

| SRS ID | Feature | Status |
|--------|---------|--------|
| FR-01 | User Registration | ✅ |
| FR-02 | Admin Verification (approve/reject) | ✅ |
| FR-03 | Secure Authentication (JWT) | ✅ |
| FR-04 | Role-Based Access Control | ✅ |
| FR-05 | Public Alumni Directory | ✅ |
| FR-06 | Profile Management | ✅ |
| FR-07 | Search & Filters | ✅ |
| FR-08 | Event Management | ✅ |
| FR-09 | Event Registration | ✅ |
| FR-10 | Jobs / Internships Board | ✅ |
| FR-11 | Mentorship Requests | ✅ |
| FR-12 | Alumni Chapters | ✅ |
| FR-13 | News, Stories & Gallery CMS | ✅ |
| FR-14 | Notifications | ✅ |
| FR-15 | Digital Alumni ID | ✅ |
| FR-16 | QR Verification | ✅ |
| FR-17 | Admin Reports & Analytics | ✅ |
| FR-18 | Audit Logs | ✅ |
| FR-19 | Privacy / Field-Level Visibility | ✅ |
| FR-20 | Documented REST API | ✅ |

---

## 12. Running the Project

- **Backend API**: `http://localhost:8080` → `php spark serve --port=8080`
- **Frontend App**: `http://localhost:5173` → `npm run dev`
- **Database**: `akal_alumni_portal` (MariaDB/MySQL)

