# 02 • Core Data Models & TypeScript Contracts

## 1. Domain Types (`src/types/index.ts`)

```typescript
export type UserRole = 'Student' | 'Faculty' | 'Secretary' | 'Admin' | 'Super Admin';

export interface UserSession {
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
}

export interface SupportTicket {
  id: string;
  category: UserRole;
  subject: string;
  description: string;
  attachmentsCount: number;
  status: 'In Progress' | 'Investigating' | 'Resolved' | 'Dispatched';
  submittedAt: string;
  department?: string;
  reporterEmail?: string;
  reporterName?: string;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  role: UserRole;
  ticketId: string;
  action: string;
  details: string;
}
```

---

## 2. Validation & Boundary Guarantees
- `id`: Human-readable identifier format (`#TK-XXXX`).
- `status`: Strictly constrained union to prevent unhandled UI triage states.
- `attachmentsCount`: Number of verified diagnostic attachments attached to the report.
