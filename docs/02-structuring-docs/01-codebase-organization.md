# 01 • Codebase Organization Principles

## 1. Modular Separation of Concerns
The SupportMSIS codebase enforces strict physical separation of concerns:

1. **Pages (`src/pages/`):**
   - Pure orchestrators and route controllers.
   - Responsible for fetching or providing route context, metadata titles, and instantiating reusable domain components.
   - Subdivided by role directory (`admin`, `faculty`, `secretary`, `student`, `super-admin`, `settings`).

2. **Domain Components (`src/components/`):**
   - Divided into feature domains (`tickets`, `dashboard`, `layout`).
   - Own their local UI interactions, sorting, filtering, modals, and pagination logic while dispatching state mutations to the shared context.

3. **UI Primitives (`src/components/ui/`):**
   - Agnostic design components (`button.tsx`, `card.tsx`, `file-upload.tsx`, `skeleton.tsx`).
   - Completely decoupled from specific support ticket models or role semantics.

4. **Context Layer (`src/context/`):**
   - Single source of truth for global session state (`AuthContext.tsx`) and application ticket inventory (`TicketsContext.tsx`).
   - Centralizes persistence, mock data hydration, and cross-component updates.

5. **Type Declarations (`src/types/`):**
   - All shared interfaces and domain unions live in `src/types/index.ts` to eliminate circular dependencies.
