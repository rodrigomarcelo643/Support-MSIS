# 02 • Responsive Design & Word-Break Rules

## 1. Preventing Unwanted Word Breaks ("Make Two Word")
On small-width screens (e.g., iPhone SE 375px, compact Android devices 360px), multi-word button labels or headers can awkwardly split into multiple lines if container constraints are violated.

### Mandatory Rules:
1. **Apply `whitespace-nowrap` on Interactive Buttons:**
   All `Button` components in `src/components/ui/button.tsx` enforce `whitespace-nowrap` in `baseStyles`. When adding inline buttons, always include `whitespace-nowrap` unless deliberate multi-line wrapping is designed.
2. **Flexible Container Wrapping:**
   Headers must allow adaptive text:
   ```tsx
   <span className="whitespace-nowrap">Track My Tickets</span>
   <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 whitespace-nowrap">
     {roleTickets.length} Filed
   </span>
   ```
3. **Full-Width Mobile Buttons:**
   On mobile screens (`< sm`), call-to-action buttons should use `w-full sm:w-auto` so they fill available horizontal space without cramped line wraps.

---

## 2. Table Responsiveness
- All data tables (`TrackTicketsList.tsx`, `SuperAdminView.tsx`) must be enclosed in an `overflow-x-auto` wrapper with an explicit minimum width (`min-w-[760px] sm:min-w-full`).
- Never allow table content to collapse into cramped illegible widths; allow smooth horizontal scrolling on mobile.
