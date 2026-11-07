<div align="center">

  <p align="center">
    <img src="src/assets/logo/southwe_main.png" alt="Southwestern University PHINMA Logo" width="130" style="margin-right: 18px;" />
    <img src="src/assets/logo/medicine-logo.png" alt="School of Medicine Logo" width="120" style="margin-left: 18px;" />
  </p>

  # MSIS Support Ticket System
  ### Southwestern University PHINMA • School of Medicine

  <p align="center">
    A unified, real-time enterprise technical triage and support portal designed specifically for students, faculty, department secretaries, and administrative staff at the Southwestern University PHINMA School of Medicine.
  </p>

  <p align="center">
    <a href="https://support.swu-som.com/"><img src="https://img.shields.io/badge/Production-Live-emerald.svg?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Live Production"></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-red.svg?style=for-the-badge" alt="License: MIT"></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.x-blue.svg?style=for-the-badge&logo=react&logoColor=white" alt="React 19"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5"></a>
    <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-8.x-purple.svg?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 8"></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4.svg?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4"></a>
  </p>

  <p align="center">
    <a href="#-overview">Overview</a> •
    <a href="#-key-features">Key Features</a> •
    <a href="#-role-based-portals--rbac">Portals & RBAC</a> •
    <a href="#-real-time-live-ticket-tracking">Live Tracking</a> •
    <a href="#-email-notifications">Email System</a> •
    <a href="#-analytics-dashboard">Dashboard</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-contributing">Contributing</a>
  </p>

</div>

---

## 🌟 Overview

The **Medical Student Information System (MSIS) Support System** provides an end-to-end incident reporting, diagnostic file transfer, real-time ticket tracking, and multi-stage triage platform for the academic and clinical community of Southwestern University PHINMA School of Medicine.

Built with high availability, responsive design, and institutional identity at its core, the platform streamlines the submission of technical concerns—from exam portal lockouts and grading inquiries to hardware diagnostics—while ensuring that technical personnel can triage, assign, respond to, and resolve issues within strict SLA deadlines.

🌐 **Official Production Instance:** [https://support.swu-som.com/](https://support.swu-som.com/)

---

## ⚡ Key Features

- **🏛️ Institutional Identity & Red Theme:**
  - Styled to Southwestern University PHINMA brand guidelines featuring official deep red palettes (`#991b1b`, `#b91c1c`, `#dc2626`) paired with modern neutral surfaces.
  - Consistent header iconography featuring the SWU University Seal and School of Medicine crest.

- **🔐 Google Workspace Single Sign-On (SSO):**
  - Seamless authentication powered by Google Identity Services (GIS).
  - Enforced domain verification for authorized institutional accounts (`@swu.phinmaed.com` and administrative staff).
  - Multi-profile switching with persistent session handling and accessible logout confirmation modals.

- **📡 Live Step-by-Step Ticket Tracker:**
  - Visual 5-stage triage progress roadmap (`Level 1: Intake` &rarr; `Level 2: Investigating` &rarr; `Level 3: Dispatched` &rarr; `Level 4: Resolved` &rarr; `Level 5: Closed`).
  - Line-integrated status indicators showing completed, active, and upcoming stages with verified timestamps.
  - Multi-attachment image previews with modal lightbox view.

- **🔄 Real-Time Reactive Sync & User-Scoped Toasts:**
  - Dynamic polling (4s active / 15s background) coupled with cross-tab BroadcastChannel and Storage events.
  - **User-Scoped Alert Filtering:** Status update toast notifications are strictly filtered to the user who reported that specific ticket—preventing notification noise from other users' tickets.
  - Triage officer notifications for newly ingested tickets are delivered exclusively to `Super Admin` and `Admin`.

- **📧 Automated Progress Tracking Emails:**
  - Built-in multi-path PHPMailer engine sending step-by-step progress tracking emails whenever tickets advance in triage status.
  - Styled with institutional typography matching the web platform (`Plus Jakarta Sans`), mobile-friendly tables, and direct single-click tracking links.
  - Fail-safe background dispatch ensuring API operations succeed regardless of mailer delivery status.

- **📊 Modern Analytics & Operations Dashboard:**
  - Dynamic dual-wave activity graph visualizing real intake and resolution trends across the academic calendar.
  - Department workload distribution mapping real ticket density across departments.
  - High-priority unresolved queue for engineering escalation.

---

## 👥 Role-Based Portals & RBAC

The MSIS Support platform implements strict role-based access control (RBAC) across five user tiers:

| Role | Scope | Access & Capabilities | Default Route |
|---|---|---|---|
| **Student** | Student Body | Submit exam, LMS, and portal bugs; upload error screenshots; track live progress. | `/student/dashboard` |
| **Faculty** | Professors & Doctors | Report academic system errors, syllabus/grade submission issues; track department tickets. | `/faculty/dashboard` |
| **Secretary** | Department Coordinators | Submit administrative and document processing bottlenecks; manage departmental tickets. | `/secretary/dashboard` |
| **Admin** | Systems & Support Staff | Manage unit tickets, dispatch to specialized queues, attach technical progress notes. | `/admin/dashboard` |
| **Super Admin** | IT Management & Engineering | Global cross-department oversight, stage triage modifications, permanent record management. | `/super-admin/dashboard` |

---

## 🚦 Real-Time Live Ticket Tracking

Every ticket submitted to MSIS Support receives a unique tracking identifier (e.g., `#TK-78911`) and dedicated whole-page tracking view:

```
[Level 1: Intake & Evaluation] ───●─── [Level 2: Root Cause Diagnostics] ───●─── [Level 3: Dispatched] ───●─── [Level 4: Resolved] ───●─── [Level 5: Closed]
```

- **Level 1 (In Progress):** Issue registered and placed in the triage evaluation queue.
- **Level 2 (Investigating):** Engineers replicate and review system diagnostic logs.
- **Level 3 (Dispatched):** Assigned to a specialized infrastructure, LMS, or database engineer.
- **Level 4 (Resolved):** Solution verified and deployed to production.
- **Level 5 (Closed):** Resolution confirmed by the reporter and archived.

---

## 📬 Automated Email Notifications

Whenever ticket status advances or a technician attaches a diagnostic note, the system dispatches an automated notification email:

- **Typography:** Uses official **Plus Jakarta Sans** via Google Fonts with inline CSS fallbacks for universal email client compatibility (Gmail, Apple Mail, Outlook).
- **Progress Stepper:** Includes a visual numbered roadmap showing current level, percentage complete, and technician remarks.
- **Direct Link:** Provides a secure one-click deep link directly into the student or faculty member's live tracking page.
- **Fail-Safe Architecture:** Mail operations run inside defensive wrappers—database status updates never crash if an external SMTP provider experiences network jitter.

---

## 📈 Analytics Dashboard

The central dashboard delivers real-time operational visibility:
- **Intake vs. Resolution Dual-Wave Curve:** Visualizes monthly intake (`#dc2626` SWU Red) vs. resolution speed (`#10b981` Emerald).
- **Unit Distribution:** Live distribution counts calculated from real database records across Portal & Enrollment, Academic Systems, Account & Access, and Hardware & Network.
- **Recent Escalation Feed:** Live ticker of incoming tickets and diagnostic file uploads.

---

## 🛠️ Tech Stack

### Frontend Architecture
- **Framework:** [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- **Bundler:** [Vite 8](https://vite.dev/) with Rolldown optimization
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Typography:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** React Context API (`AuthContext`, `TicketsContext`, `ToastContext`)

### Backend Architecture
- **Language / Runtime:** PHP 8.2 / 8.3
- **Database:** MySQL / MariaDB (InnoDB utf8mb4)
- **Mailer:** [PHPMailer](https://github.com/PHPMailer/PHPMailer) 6.x
- **Hosting:** Hostinger LiteSpeed Web Server
- **Authentication:** Google Identity Services (GIS) OAuth 2.0 Client

---

## 📂 Directory Structure

```text
SupportMSIS/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md            # Standard bug report template
│   │   └── feature_request.md       # Feature request template
│   └── PULL_REQUEST_TEMPLATE.md     # Pull request guidelines & checklist
├── api/
│   └── v1/
│       ├── connection.php           # PDO/MySQLi connection with environment loader
│       ├── auth/                    # Institutional Google SSO API endpoints
│       └── tickets/
│           ├── create.php           # Ticket intake & file upload handler
│           ├── list.php             # Filterable tickets query endpoint
│           ├── get.php              # Full ticket detail & attachments resolver
│           ├── update_status.php    # Multi-stage triage updater & audit logger
│           ├── mailer.php           # PHPMailer template & email notification engine
│           └── helpers.php          # Ticket schema auto-provisioning & formatting
├── public/
│   ├── medicine-logo.png            # Southwestern School of Medicine emblem
│   └── southwe_main.png             # Southwestern University PHINMA seal
├── src/
│   ├── assets/                      # Static branding assets
│   ├── components/
│   │   ├── dashboard/               # Role dashboards, analytics charts & activity feed
│   │   ├── layout/                  # Responsive sidebar, bottom navigation & header
│   │   ├── tickets/                 # Submit form, filterable list & live tracker view
│   │   └── ui/                      # Reusable buttons, cards, skeletons & file uploaders
│   ├── context/                     # Application state (Auth, Tickets, Toasts)
│   ├── routes/                      # Role authorization guards & redirects
│   ├── services/                    # REST API integration clients
│   └── types/                       # TypeScript models & role unions
├── CODE_OF_CONDUCT.md             # Institutional ethics & medical data privacy covenant
├── CONTRIBUTING.md                  # Development guidelines & contribution process
├── CHANGELOG.md                     # Release history & version milestones
├── LICENSE                          # MIT License (Owned by MSIS Southwestern University PHINMA)
└── vite.config.ts                   # Vite bundler configuration
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or v20.x LTS)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- PHP 8.1+ & MySQL (optional for local API testing; production points to Hostinger backend)

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
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Set your configuration:
   ```env
   VITE_BACKEND_URL=https://support.swu-som.com
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

4. **Launch development server:**
   ```bash
   pnpm dev
   ```
   Navigate to `http://localhost:5173` in your browser.

5. **Build for production:**
   ```bash
   pnpm build
   ```

---

## 🤝 Documentation & Contributing

We welcome contributions to the MSIS Support platform. Please consult the dedicated documentation files:

- 📋 [**CONTRIBUTING.md**](CONTRIBUTING.md) — Coding conventions, branch workflows, and PR requirements.
- ⚖️ [**CODE_OF_CONDUCT.md**](CODE_OF_CONDUCT.md) — Institutional standards, professional conduct, and patient privacy safeguards.
- 📦 [**PULL_REQUEST_TEMPLATE.md**](.github/PULL_REQUEST_TEMPLATE.md) — Standard checklist for submitting pull requests.
- 📝 [**CHANGELOG.md**](CHANGELOG.md) — Record of updates, enhancements, and version 1.0.0 milestones.
- 📚 [**Architecture & System Docs**](docs/00-overview/01-system-architecture.md) — Technical specifications and data flow models.

---

## 📄 License

This project is licensed under the **MIT License** owned by **MSIS - Southwestern University PHINMA School of Medicine** — see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 MSIS - Southwestern University PHINMA School of Medicine. All rights reserved.

---

<div align="center">
  <p><strong>Southwestern University PHINMA • School of Medicine</strong></p>
  <p>Medical Student Information System (MSIS) &bull; Urgello St., Sambag II, Cebu City, Philippines 6000</p>
</div>
