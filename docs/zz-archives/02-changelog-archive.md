# 02 • Changelog & Architectural Migration Archive

## Version History

### [v1.3.0] - 2026-11-06
- **Feature:** Added table pagination across `TrackTicketsList.tsx` and `SuperAdminView.tsx`.
- **Feature:** Added configurable Rows Per Page (`10`, `20`, `50` rows per page max).
- **UX:** Converted horizontal status filter pills into a compact interactive `<select>` dropdown.
- **Bugfix:** Solved modal header clipping issue in inspection modals by enforcing fixed header and footer zones.
- **Cleanup:** Removed redundant `department` column from role-based ticket tracking tables.

### [v1.2.0] - 2026-11-06
- **UX:** Converted static status point indicators to live status `<select>` dropdown triage.
- **Bugfix:** Corrected layout structure in `TrackTicketsList.tsx` to keep the filter selection above and the table below.
- **UI:** Removed duplicate logos and redundant heading titles on `LoginPage.tsx`.
- **Layout:** Fixed desktop sidebar in place with `fixed top-0 bottom-0 left-0 z-30 h-screen`.

### [v1.1.0] - 2026-11-06
- **Responsiveness:** Eliminated multi-line text breaking on mobile devices by adding `whitespace-nowrap` across button and badge primitives.
- **Mobile UX:** Optimized touch targets and padding on `PublicPage.tsx` and user role consoles.

### [v1.0.0] - Initial Release
- **Core:** Google Identity Services (GIS) SSO with `@swu.phinmaed.com` institutional validation.
- **Architecture:** Role-attributed portals for Student, Faculty, Secretary, Admin, and Super Admin.
- **Theme:** Southwestern University PHINMA • School of Medicine design system.
