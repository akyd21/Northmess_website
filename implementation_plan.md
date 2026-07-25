# North Mess Management System (NMMS) – Implementation Plan

## Overview

Build a modern full-stack web application for North Mess with **React + Tailwind CSS** frontend and **Spring Boot + MongoDB** backend. The system supports two roles: **Student** and **Mess Secretary (Admin)**.

> [!IMPORTANT]
> This is a very large project (~20+ features, 30+ pages). To keep it manageable and deliver working software incrementally, the plan is broken into **4 phases**. Each phase will produce a deployable, testable system.

---

## User Review Required

> [!WARNING]
> **Technology Choices to Confirm:**
> 1. **Tailwind CSS version** – The PRD mentions Tailwind CSS. I'll use **Tailwind CSS v3** (stable, widely supported). Confirm if you want v4 instead.
> 2. **UI Library** – PRD mentions both Material UI and ShadCN. I recommend **ShadCN/UI** (works beautifully with Tailwind, lightweight, modern). Confirm your preference.
> 3. **Vite vs CRA** – I'll use **Vite** for React (faster builds, modern). Confirm if you prefer Create React App.
> 4. **MongoDB Atlas** – You'll need to provide a MongoDB Atlas connection string for the backend. For local dev, I can configure a local MongoDB URI.
> 5. **Email (Spring Mail)** – You'll need to provide SMTP credentials (Gmail App Password or similar) for the email notification feature.

> [!IMPORTANT]
> **Scope Decision:** The PRD lists ~21 core features and ~10 advanced features. Building everything at once is impractical. I propose delivering in 4 phases:
> - **Phase 1** (Core): Project setup, Auth, Home, Menus, Staff, About — a usable MVP
> - **Phase 2** (Engagement): Feedback, Complaints, Announcements, Email, Gallery
> - **Phase 3** (Admin Power): Admin Dashboard, Analytics, Reports, Student Management
> - **Phase 4** (Advanced): Dark Mode, Polling, AI Analysis, QR, Push Notifications, etc.
>
> **Do you want me to build all 4 phases, or start with Phase 1 and iterate?**

---

## Open Questions

1. **Do you have a MongoDB Atlas connection string ready**, or should I set up local MongoDB config for development?
2. **Do you have SMTP credentials** for Spring Mail (e.g., Gmail app password)?
3. **Do you have a North Mess logo image**, or should I generate one?
4. **Admin credentials** – Should the first admin be seeded in the database, or created via a separate registration flow?
5. **Deployment** – Should I configure deployment (Vercel + Render) now, or focus on local development first?
6. **Sample menu data** – Should I use the example data from the PRD (Idli, Dosa, etc.) as seed data?

---

## Phase 1: Core Foundation & MVP

### Goal
Set up the full project scaffold, authentication system, home page, menu display, staff page, and basic student/admin flows.

---

### Frontend Setup (React + Vite + Tailwind)

#### [NEW] `frontend/` — React project via Vite

```
frontend/
├── public/
├── src/
│   ├── assets/              # Images, icons, logos
│   ├── components/
│   │   ├── layout/          # Navbar, Footer, Sidebar, DarkModeToggle
│   │   ├── ui/              # Button, Card, Input, Modal, Rating, Badge
│   │   └── common/          # Loader, ErrorBoundary, ProtectedRoute
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── TodaysMenu.jsx
│   │   ├── WeeklyMenu.jsx
│   │   ├── Staff.jsx
│   │   ├── Students.jsx       # Student gallery
│   │   ├── Feedback.jsx
│   │   ├── Complaints.jsx
│   │   ├── Gallery.jsx
│   │   ├── Contact.jsx
│   │   ├── Announcements.jsx
│   │   └── NotFound.jsx
│   ├── services/
│   │   ├── api.js            # Axios instance with JWT interceptor
│   │   ├── authService.js
│   │   ├── menuService.js
│   │   ├── feedbackService.js
│   │   ├── studentService.js
│   │   ├── complaintService.js
│   │   ├── announcementService.js
│   │   ├── staffService.js
│   │   └── galleryService.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useMenu.js
│   │   └── useFeedback.js
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validators.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

**Key dependencies:**
- `react`, `react-dom`, `react-router-dom`
- `tailwindcss`, `postcss`, `autoprefixer`
- `axios`
- `react-hook-form`
- `react-icons`
- `chart.js`, `react-chartjs-2` (Phase 3)
- `@radix-ui/react-*` (ShadCN primitives)
- `lucide-react`
- `framer-motion` (animations)

---

### Backend Setup (Spring Boot 3 + Java 21)

#### [NEW] `backend/` — Spring Boot project

```
backend/
├── src/main/java/com/northmess/
│   ├── NorthMessApplication.java
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── StudentController.java
│   │   ├── MenuController.java
│   │   ├── FeedbackController.java
│   │   ├── ComplaintController.java
│   │   ├── AnnouncementController.java
│   │   ├── StaffController.java
│   │   ├── GalleryController.java
│   │   └── ReportController.java
│   ├── service/
│   │   ├── AuthService.java
│   │   ├── StudentService.java
│   │   ├── MenuService.java
│   │   ├── FeedbackService.java
│   │   ├── ComplaintService.java
│   │   ├── AnnouncementService.java
│   │   ├── StaffService.java
│   │   ├── GalleryService.java
│   │   ├── EmailService.java
│   │   └── ReportService.java
│   ├── repository/
│   │   ├── StudentRepository.java
│   │   ├── AdminRepository.java
│   │   ├── MenuRepository.java
│   │   ├── FeedbackRepository.java
│   │   ├── ComplaintRepository.java
│   │   ├── AnnouncementRepository.java
│   │   ├── StaffRepository.java
│   │   ├── GalleryRepository.java
│   │   └── ActivityLogRepository.java
│   ├── entity/
│   │   ├── Student.java
│   │   ├── Admin.java
│   │   ├── Menu.java
│   │   ├── WeeklyMenu.java
│   │   ├── Feedback.java
│   │   ├── Complaint.java
│   │   ├── Announcement.java
│   │   ├── Staff.java
│   │   ├── GalleryImage.java
│   │   └── ActivityLog.java
│   ├── dto/
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   ├── AuthResponse.java
│   │   ├── StudentDTO.java
│   │   ├── MenuDTO.java
│   │   ├── FeedbackDTO.java
│   │   ├── ComplaintDTO.java
│   │   └── AnnouncementDTO.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── CorsConfig.java
│   │   ├── MongoConfig.java
│   │   └── WebConfig.java
│   ├── security/
│   │   ├── JwtTokenProvider.java
│   │   ├── JwtAuthFilter.java
│   │   ├── CustomUserDetailsService.java
│   │   └── JwtAuthEntryPoint.java
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   ├── ResourceNotFoundException.java
│   │   └── BadRequestException.java
│   ├── mailer/
│   │   └── FeedbackMailer.java
│   └── utils/
│       ├── AppConstants.java
│       └── FileUploadUtil.java
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   └── templates/
│       └── feedback-email.html   # Thymeleaf email template
├── pom.xml
└── .env.example
```

---

### Phase 1 Components Detail

#### Authentication System

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/api/auth/register` | POST | Student registration (with photo upload) | Public |
| `/api/auth/login` | POST | Login (returns JWT) | Public |
| `/api/auth/me` | GET | Get current user profile | JWT |

- **JWT flow**: Login → receive access token → store in localStorage → attach in Authorization header
- **Password**: BCrypt hashed
- **Roles**: `STUDENT`, `ADMIN`
- **Registration status**: `PENDING` → Admin approves → `APPROVED`

#### Home Page

Premium, animated landing page with:
- **Hero Section**: Full-width banner with gradient overlay, animated text, North Mess logo
- **About Section**: Cards with intro, history, mission, vision, facilities (with subtle scroll animations via Framer Motion)
- **Today's Menu**: Auto-detects day of week, displays Breakfast/Lunch/Dinner cards with food emojis and smooth transitions
- **Weekly Schedule**: Beautiful responsive table with hover effects
- **Announcements Ticker**: Scrolling banner for latest notices

#### Menu System

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/api/menus/today` | GET | Get today's menu | Public |
| `/api/menus/weekly` | GET | Get full weekly menu | Public |
| `/api/menus/{day}` | PUT | Update menu for a day | Admin |
| `/api/menus/weekly` | PUT | Update entire weekly menu | Admin |

**MongoDB `menus` collection schema:**
```json
{
  "_id": "ObjectId",
  "day": "MONDAY",
  "breakfast": ["Idli", "Sambar", "Tea"],
  "lunch": ["Rice", "Sambar", "Fish Curry", "Papad"],
  "dinner": ["Chapati", "Chicken Curry", "Salad"],
  "updatedAt": "ISODate",
  "updatedBy": "adminId"
}
```

#### Staff Page

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/api/staff` | GET | Get all staff | Public |
| `/api/staff` | POST | Add staff member | Admin |
| `/api/staff/{id}` | PUT | Update staff | Admin |
| `/api/staff/{id}` | DELETE | Delete staff | Admin |

#### Student Registration & Login Pages
- Clean, animated forms using React Hook Form + validation
- Photo upload with preview
- ID card upload with preview
- Success/error toast notifications

#### Student Dashboard
- Welcome card with user's name and photo
- Quick-access cards: Today's Menu, Submit Feedback, My Profile, Weekly Menu, Notices
- Recent announcements sidebar

#### Admin Dashboard (Basic)
- Student count, pending approvals count
- Quick links to manage menus, students, feedback

---

## Phase 2: Engagement Features

### Feedback System

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/api/feedback` | POST | Submit weekly feedback | Student |
| `/api/feedback` | GET | Get all feedback | Admin |
| `/api/feedback/my` | GET | Get student's own feedback | Student |

- Star ratings (1-5) for: Food Quality, Taste, Hygiene, Quantity, Staff Behaviour, Cleanliness
- Comment/suggestions text box
- On submit → Spring Mail sends email to Mess Secretary

### Complaint System

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/api/complaints` | POST | Submit complaint | Student |
| `/api/complaints` | GET | Get all complaints | Admin |
| `/api/complaints/{id}/status` | PUT | Update status | Admin |

- Categories: Food, Water, Cleanliness, Staff Behaviour, Others
- Status: PENDING → RESOLVED / REJECTED

### Announcements

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `/api/announcements` | GET | Get all announcements | Public |
| `/api/announcements` | POST | Create announcement | Admin |
| `/api/announcements/{id}` | DELETE | Delete announcement | Admin |

### Email Notifications
- Thymeleaf HTML template for beautiful emails
- Triggered on feedback submission
- Contains student info + ratings + suggestions

### Student Gallery Page
- Instagram-style grid cards with photo, name, dept, year, room
- Search + filter by department, year
- Pagination

### Image Gallery
- Grid of mess photos (building, dining, kitchen, food, events)
- Lightbox viewer
- Admin can upload/delete images

### Contact Page
- Mess location info, Google Maps embed
- Phone, email, office timing
- Contact form (optional)

---

## Phase 3: Admin Power Features

### Feedback Analytics Dashboard
- Charts using Chart.js:
  - Average food rating (bar chart)
  - Weekly rating trends (line chart)
  - Monthly trends
  - Category-wise breakdown (radar chart)
  - Most common complaint categories (pie chart)

### Reports
- Export feedback report as PDF/Excel
- Export student list as PDF/Excel
- Using libraries like `jspdf` + `xlsx` on frontend, or generated on backend

### Student Management (Admin)
- View all students
- Approve/reject pending registrations
- Search by name, roll number, department
- View student details

### Notice Board
- Dedicated page for all notices
- Categorized: Holidays, Menu Changes, Hostel Notices
- Date-sorted

---

## Phase 4: Advanced Features

### Dark Mode
- Theme toggle in navbar
- ThemeContext with localStorage persistence
- Tailwind `dark:` classes throughout

### Polling System
- Vote for Sunday special meal
- Quick satisfaction surveys

### QR-Based Attendance (Optional)
- Generate unique QR per meal
- Students scan to mark attendance
- Analytics on meal participation

### AI Feedback Analysis
- Sentiment analysis on feedback text
- Auto-summarize weekly feedback
- Suggest improvements

### Push Notifications
- Service workers + Web Push API
- Notify on menu changes, announcements

### Emergency Notice Banner
- Sticky top banner for urgent notices
- Admin toggleable

### Admin Activity Logs
- Record all admin actions
- Viewable in admin dashboard

---

## Verification Plan

### Automated Tests
- **Backend**: JUnit 5 + Mockito for service/controller tests
  ```
  mvn test
  ```
- **Frontend**: Vitest + React Testing Library for component tests
  ```
  npm test
  ```

### Manual Verification
- Test all auth flows (register, login, JWT refresh)
- Test menu auto-detection (change system date)
- Test feedback submission + email delivery
- Test admin CRUD operations
- Test responsive design on mobile/tablet/desktop
- Test dark mode toggle
- Verify MongoDB Atlas connectivity

### Build Verification
```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend && mvn clean package
```

---

## Estimated File Count
- **Frontend**: ~60-80 files
- **Backend**: ~50-60 files
- **Total**: ~110-140 files

> [!IMPORTANT]
> **Recommendation**: Let me start with **Phase 1** to give you a working, deployable MVP quickly. We can then iterate on Phase 2-4 based on your feedback. Please confirm your preferences on the open questions above before I begin.
