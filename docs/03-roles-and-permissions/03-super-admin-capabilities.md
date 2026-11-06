# 03 • Super Admin Central Console

## 1. Overview
The **Super Admin Central Console** (`SuperAdminView.tsx` and `SuperAdminDashboardPage.tsx`) provides high-level administrative oversight and diagnostic telemetry across all School of Medicine divisions.

---

## 2. Key Capabilities

1. **Unified Cross-Role Feed:**
   - Aggregates real-time ticket submissions from Students, Faculty, Secretaries, and System Administrators into one centralized audit queue.
   - Includes quick-filter role chips (`All Roles`, `Student`, `Faculty`, `Secretary`, `Admin`).

2. **Full-Spectrum Status Triage:**
   - Super Admins can transition any ticket's state directly using inline `<select>` controls or inside the ticket inspection modal:
     - `In Progress`
     - `Investigating`
     - `Resolved`
     - `Dispatched`

3. **Global Role Simulation / Switcher:**
   - Allows Super Admins to view the application through the exact lens of a Student, Faculty member, Secretary, or Admin to verify role permissions and UI behavior.

4. **Integrated Pagination:**
   - Features built-in pagination with 10, 20, and 50 rows per page to handle high ticket volume smoothly.
