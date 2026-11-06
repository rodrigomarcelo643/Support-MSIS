# MSIS Support | School of Medicine

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)
[![Production](https://img.shields.io/badge/Production-Live-emerald.svg)](https://support.swu-som.com/)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-cyan.svg)](https://tailwindcss.com/)

**MSIS Support** is the centralized technical issue reporting, bug triage, and ticket tracking system for the **Medical Systems & Information Services (MSIS)** at **Southwestern University PHINMA • School of Medicine**.

🌐 **Production URL:** [https://support.swu-som.com/](https://support.swu-som.com/)

---

## 📌 Features

- **Institutional Google Single Sign-On (SSO):**
  - Secured Google Workspace authentication restricted to permitted institutional accounts (`@swu.phinmaed.com` and authorized institutional staff).
  - Authentic popup and One Tap login flow with verified profile telemetry.

- **Modular Role-Based Portals:**
  - **Student Portal:** Direct reporting of student LMS issues, exam timeouts, and portal bugs with live tracking.
  - **Faculty Portal:** Faculty-specific bug submissions, grade portal issue reporting, and department triage.
  - **Secretary Portal:** Academic affairs, document upload, and administrative workflow issue submission.
  - **Admin Portal:** System administration, permission management, and infrastructure tickets.
  - **Super Admin Central Console:** Institutional oversight dashboard, real-time ticket inspection modal, and live status triage across all 4 user queues.

- **Streamlined Ticket Submission:**
  - Role-attributed ticket creation (Subject, Description, and Multi-file attachments).
  - Automatically categorized under the reporter's role without redundant department selectors.
  - Attach screenshots, logs, and diagnostic files (up to 5 files, 10MB each).

- **Responsive Multi-Device Layout:**
  - **Desktop:** Collapsible sidebar with Southwestern University seal branding, institutional red navigation, and subtle divider gap.
  - **Mobile & Tablet (`sm`/`md`):** Floating curved bottom navigation bar with elevated center `+ Submit` button.

- **Skeleton Loaders:**
  - Polished shimmer skeleton screens across all views (`Dashboard`, `Submit Ticket`, `Track Tickets`, `Activity`, `Settings`, and `Sidebar`) to ensure smooth visual transitions without layout shift.

- **Global Logout Confirmation Modal:**
  - Accessible application-wide modal to confirm session termination safely with `ESC` keyboard support.

---

## 📂 Project Directory Structure

```text
SupportMSIS/
├── routes/
│   ├── ProtectedRoute/
│   │   └── Index.tsx               # Auth verification guard with full-page skeleton
│   └── PublicRoute/
│       └── Index.tsx               # Public route redirect for authenticated users
├── src/
│   ├── assets/
│   │   └── logo/
│   │       ├── medicine-logo.png   # Green medical shield logo
│   │       └── southwe_main.png    # Southwestern University PHINMA seal
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── ActivityFeedView.tsx     # Role activity & audit log timeline
│   │   │   ├── RoleDashboardView.tsx    # Standard role dashboard & metric cards
│   │   │   ├── SuperAdminView.tsx       # Global ticket management table & inspector
│   │   │   └── UserRoleView.tsx         # User role switcher view
│   │   ├── layout/
│   │   │   ├── AppSidebar.tsx           # Collapsible desktop sidebar with brand header
│   │   │   ├── BottomNav.tsx            # Floating mobile bottom navigation bar
│   │   │   └── DashboardLayout.tsx      # Main layout wrapper (Header, Sidebar, Outlet, BottomNav)
│   │   ├── tickets/
│   │   │   ├── SubmitTicketForm.tsx     # Clean bug report & ticket submission form
│   │   │   └── TrackTicketsList.tsx     # Filterable ticket tracking list with status badges
│   │   └── ui/
│   │       ├── button.tsx               # Custom button with variant styling
│   │       ├── card.tsx                 # Base card container
│   │       ├── file-upload.tsx          # Drag-and-drop file upload with preview
│   │       ├── LogoutConfirmModal.tsx   # Global session sign-out confirmation modal
│   │       ├── select.tsx               # Dropdown selector
│   │       └── skeleton.tsx             # Shimmer skeleton loader presets and hooks
│   ├── context/
│   │   ├── AuthContext.tsx              # Google OAuth session & global logout modal state
│   │   └── TicketsContext.tsx           # Ticket state management, counts, and persistence
│   ├── lib/
│   │   ├── config.ts                    # Backend URL & Google Client ID configuration
│   │   └── utils.ts                     # ClassName merger utility (cn)
│   ├── pages/
│   │   ├── admin/                       # Admin role pages (Dashboard, Submit, Track, Activity)
│   │   ├── faculty/                     # Faculty role pages (Dashboard, Submit, Track, Activity)
│   │   ├── secretary/                   # Secretary role pages (Dashboard, Submit, Track, Activity)
│   │   ├── student/                     # Student role pages (Dashboard, Submit, Track, Activity)
│   │   ├── super-admin/                 # Super Admin pages (Dashboard, Tickets, Activity)
│   │   ├── settings/
│   │   │   └── RoleSettingsPage.tsx     # Account settings, notification toggles, sign-out
│   │   ├── AuthCallbackPage.tsx         # Google OAuth callback handler
│   │   ├── DashboardPage.tsx            # Legacy / redirect controller
│   │   ├── LoginPage.tsx                # Dual-column showcase sign-in portal
│   │   └── PublicPage.tsx               # Public landing page with support overview
│   ├── routes/
│   │   ├── RoleGuard.tsx                # Role-based route authorization guard
│   │   └── RoleRedirect.tsx             # Automatic redirection to user's assigned role path
│   ├── types/
│   │   └── index.ts                     # TypeScript interfaces (SupportTicket, UserRole, AuthUser)
│   ├── App.tsx                          # Application router, providers, and route definitions
│   ├── index.css                        # Tailwind CSS v4 base styles, fonts, and animations
│   └── main.tsx                         # React 19 application entrypoint
├── LICENSE                              # MIT License
├── package.json                         # Project dependencies and npm scripts
├── tsconfig.json                        # TypeScript compiler options
└── vite.config.ts                       # Vite configuration
```

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Build Tool:** [Vite 8](https://vite.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Package Manager:** [pnpm](https://pnpm.io/)
- **Backend API:** PHP 8.x / MariaDB (Hosted on Hostinger)
- **Authentication:** Google Identity Services (GIS) OAuth 2.0

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18+ recommended)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rodrigomarcelo643/Support-MSIS.git
   cd Support-MSIS
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (optional, fallbacks provided):
   ```env
   VITE_BACKEND_URL=https://support.swu-som.com
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

5. **Build for production:**
   ```bash
   pnpm build
   ```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 Southwestern University PHINMA - School of Medicine (MSIS)
