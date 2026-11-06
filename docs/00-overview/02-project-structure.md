# 02 • Project Directory Structure

## 1. Directory Tree

```text
c:/xampp/htdocs/SupportMSIS/
├── docs/                               # Standardized documentation repository
│   ├── 00-overview/                   # System architecture and codebase overview
│   ├── 01-agent-docs/                 # AI coding agent protocols and workflows
│   ├── 02-structuring-docs/           # Directory patterns, layers, and conventions
│   ├── 03-roles-and-permissions/      # Role specifications and security guards
│   ├── 04-formatting-and-styling/     # Design tokens, responsive rules, modals
│   ├── 05-api-and-state/              # State context, mock stores, models
│   └── zz-archives/                   # Historical changelogs and design evolutions
├── public/                            # Static public assets (logos, favicon)
├── routes/                            # Route perimeter guards
│   ├── ProtectedRoute/                # Enforces authentication & displays skeleton
│   └── PublicRoute/                   # Redirects authenticated users away from /login
├── src/                               # Application source code
│   ├── assets/                        # Component-level static graphics & logos
│   │   └── logo/                      # University & Medical School official branding
│   ├── components/                    # Reusable React components
│   │   ├── dashboard/                 # Role dashboards, activity feeds, central console
│   │   ├── layout/                    # Sidebar, bottom nav, dashboard shell
│   │   ├── tickets/                   # Ticket creation form & tracking table
│   │   └── ui/                        # Low-level UI primitives (Button, Card, Modals)
│   ├── context/                       # Global state providers (Auth, Tickets)
│   ├── lib/                           # Utility functions & environment configuration
│   ├── pages/                         # Route view controllers organized by role
│   │   ├── admin/                     # System administrator views
│   │   ├── faculty/                   # Faculty member views
│   │   ├── secretary/                 # Secretary administrative views
│   │   ├── settings/                  # User profile and notification settings
│   │   ├── student/                   # Student views
│   │   └── super-admin/               # Global Super Admin console views
│   ├── routes/                        # Internal role routing utilities
│   │   ├── RoleGuard.tsx              # Strict RBAC verification
│   │   └── RoleRedirect.tsx           # Initial entry redirector
│   ├── types/                         # Centralized TypeScript declarations
│   ├── App.tsx                        # Root routing definition
│   ├── index.css                      # Global Tailwind CSS imports & animations
│   └── main.tsx                       # React 19 application entrypoint
├── eslint.config.js                   # Linter configuration
├── package.json                       # Dependencies & build scripts
├── tsconfig.json                      # TypeScript root project references
└── vite.config.ts                     # Vite build & plugin configuration
```

---

## 2. Source Code Layer Map

| Directory | Layer Responsibility | Allowed Dependencies |
| :--- | :--- | :--- |
| `src/types/` | Data contracts & domain types | None (Pure TypeScript interfaces & types) |
| `src/lib/` | Reusable utilities & environment helpers | External pure utility libraries (`clsx`, `tailwind-merge`) |
| `src/components/ui/` | Primitives (Buttons, Cards, Inputs) | `src/lib/`, `lucide-react` |
| `src/components/tickets/`, `dashboard/` | Feature-level domain components | `src/components/ui/`, `src/context/`, `src/types/` |
| `src/components/layout/` | Structural shells (Sidebar, BottomNav) | `src/components/ui/`, `src/context/` |
| `src/context/` | State management engines | `src/types/`, `src/lib/` |
| `src/pages/` | Routed view compositions | All component layers, contexts, and hooks |
| `src/routes/` | Access gates and role dispatchers | `src/context/`, `src/types/` |
