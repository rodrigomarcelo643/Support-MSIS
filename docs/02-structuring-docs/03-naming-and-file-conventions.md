# 03 • Naming & File Conventions

## 1. File & Directory Naming Rules

| Asset Type | Convention | Example |
| :--- | :--- | :--- |
| **React Components** | `PascalCase.tsx` | `TrackTicketsList.tsx`, `AppSidebar.tsx` |
| **UI Primitives** | `kebab-case.tsx` | `button.tsx`, `file-upload.tsx`, `skeleton.tsx` |
| **React Pages** | `PascalCasePage.tsx` | `LoginPage.tsx`, `AdminDashboardPage.tsx` |
| **Context Providers** | `PascalCaseContext.tsx` | `AuthContext.tsx`, `TicketsContext.tsx` |
| **Route Guards** | `PascalCase.tsx` | `RoleGuard.tsx`, `RoleRedirect.tsx` |
| **Utility Libraries** | `camelCase.ts` | `config.ts`, `utils.ts` |
| **Documentation** | `##-kebab-case.md` | `01-system-architecture.md`, `02-responsive-rules.md` |

---

## 2. Code Declaration Conventions

1. **Named Exports:** Prefer named component exports `export const ComponentName: React.FC<Props> = ...` with a companion `export default ComponentName` for flexibility.
2. **Explicit Prop Types:** Always define an interface `[ComponentName]Props` even if empty or extending native HTML attributes.
3. **No Magic Strings:** System roles (`Student`, `Faculty`, `Secretary`, `Admin`, `Super Admin`) and ticket statuses (`In Progress`, `Investigating`, `Resolved`, `Dispatched`) must be strongly typed through union types in `src/types/index.ts`.
