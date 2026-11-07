# Changelog

All notable changes to the **MSIS Support Ticket System** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-07

### Added
- **Live Whole-Page Ticket Tracker**: Step-by-step progress roadmap view with integrated line-based level indicators (`Level 1` through `Level 5`).
- **Institutional Email Typography**: Integrated **Plus Jakarta Sans** via Google Fonts and inline CSS cascades into all automated progress update emails.
- **Fail-Safe Multi-Path Mailer**: Resilient PHPMailer loader that searches multiple webroot and vendor directories, ensuring ticket operations never crash when mailer libraries are unavailable.
- **User-Scoped Real-Time Toast Notifications**: Refactored background sync so that ticket progress toasts are only shown to the ticket owner or Super Admin, preventing cross-user notification spam.
- **Multi-Role Portals & RBAC**: Dedicated operational dashboards for Students, Faculty, Department Secretaries, System Admins, and Super Admins.
- **Real-Time Cross-Tab Synchronization**: Added BroadcastChannel and localStorage sync signal to update ticket states across browser tabs instantly without manual refresh.
- **Multi-File Attachment System**: Support for uploading diagnostic files (images, logs, documents) per ticket submission with modal lightbox viewer.
- **Responsive Multi-Device Layout**: Collapsible desktop sidebar paired with curved bottom navigation bar on mobile/tablet viewports.
- **Enterprise Project Documentation**: Added centered branding and badge headers in README, `.github/PULL_REQUEST_TEMPLATE.md`, issue templates, and `CONTRIBUTING.md`.

### Changed
- **Modern Analytics Overview**: Replaced dummy mock data on role dashboards with 100% real database records, dynamic dual-wave intake/resolution charts, and dynamic department workload cards.
- **Theme Standardization**: Aligned all headers, progress cards, and accent buttons with Southwestern University PHINMA brand red (`#991b1b` / `#b91c1c` / `#dc2626`).

### Fixed
- **HTTP 500 on Status Update**: Resolved fatal uncatchable error caused by unconditional `require_once` on missing PHPMailer files in `update_status.php`.
- **React Hook Order Violation**: Fixed React Rules of Hooks error in `TrackTicketsList.tsx` by relocating `useCallback` and `useEffect` above early skeleton returns.
- **Windows NTFS Environment Loading**: Replaced `is_readable()` check in `connection.php` with direct file parsing to eliminate false-negative file read failures.

### Security
- **Google SSO Domain Verification**: Enforced domain verification for authorized institutional emails.
- **Global Logout Confirmation**: Accessible application-wide modal with keyboard shortcuts to prevent accidental session termination.
