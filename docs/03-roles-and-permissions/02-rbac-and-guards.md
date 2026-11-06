# 02 • RBAC Routing & Security Guards

## 1. Route Security Perimeter

The client router enforces multi-layered authorization barriers to prevent privilege escalation:

```text
[Incoming Route Request]
          │
          ▼
   [ProtectedRoute] ──── No Auth ───► Redirect to /login
          │
      Authorized
          │
          ▼
     [RoleGuard] ──── Wrong Role ───► Redirect to /${userRole}
          │
      Authorized
          │
          ▼
   [Render Target View]
```

---

## 2. Guard Component Specifications

### A. `ProtectedRoute/Index.tsx`
- Intercepts all authenticated subpaths.
- Inspects `isAuthenticated` from `AuthContext`.
- If loading session state, renders full-page shimmer skeleton (`AppSkeleton`) to eliminate layout flashing.
- If unauthenticated, redirects immediately to `/login`.

### B. `routes/RoleGuard.tsx`
- Accepts `allowedRoles: UserRole[]`.
- Compares current active user role against permitted roles.
- If a Student attempts to access `/admin/*` or `/super-admin/*`, the guard redirects them back to `/student/dashboard`.

### C. `routes/RoleRedirect.tsx`
- Dispatched when a user hits `/dashboard` or root entry without a specific role slug.
- Maps user session to their primary home route (`/student`, `/faculty`, `/secretary`, `/admin`, or `/super-admin`).
