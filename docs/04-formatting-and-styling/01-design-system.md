# 01 • Design System & Tokens

## 1. Institutional Identity & Colors
SupportMSIS adheres to the official brand standards of **Southwestern University PHINMA • School of Medicine**:

| Token Name | Hex Code | Tailwind Utility | Purpose |
| :--- | :--- | :--- | :--- |
| **SWU Crimson/Red** | `#dc2626` / `#b91c1c` | `bg-red-600`, `hover:bg-red-700` | Primary action buttons, brand accents, active filters |
| **SWU Red Tint** | `#fef2f2` | `bg-red-50`, `text-red-700` | Pill badges, attachment counts, error states |
| **Medical Emerald** | `#059669` / `#10b981` | `bg-emerald-600`, `text-emerald-700` | Resolved ticket status, success alerts |
| **Diagnostic Amber** | `#d97706` / `#f59e0b` | `bg-amber-50`, `text-amber-700` | In-progress ticket triage state |
| **Investigation Sky** | `#0284c7` / `#0ea5e9` | `bg-sky-50`, `text-sky-700` | Active investigation triage state |
| **Dispatch Purple** | `#7c3aed` / `#8b5cf6` | `bg-purple-50`, `text-purple-700` | Escalated / dispatched triage state |
| **Slate Neutrals** | `#f4f6fa` → `#0f172a` | `bg-[#f4f6fa]`, `text-slate-800` | App background, card borders, subtle dividers |

---

## 2. Typography
- **Primary Typeface:** `Plus Jakarta Sans` imported via Google Fonts (`index.html`).
- **Code & Reference Numbers:** Monospace (`font-mono text-[11px] font-bold text-red-600`) for ticket IDs (`#TK-83002`).
- **Hierarchy:**
  - Page Titles: `text-base sm:text-lg font-bold text-slate-900 tracking-tight`
  - Section Headers: `text-xs sm:text-sm font-bold text-slate-800`
  - Body & Table Text: `text-xs text-slate-700`
  - Captions & Meta: `text-[10px] sm:text-[11px] text-slate-400 font-medium`
