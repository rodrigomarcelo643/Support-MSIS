# 03 • Modal & Dialog Architecture

## 1. The Header Cutoff & Stacking Context Problem
When rendering modal dialogs:
1. **Header Cutoff:** Never place `p-4` or `p-6` with `overflow-y-auto` directly on the outer card container. Doing so causes the modal header (ticket ID, title, and close button) to scroll upward into the top rounded corners, cutting off the text.
2. **Stacking Context Overlapping:** When parent containers have CSS animations (`animate-fadeIn` utilizing `transform: translateY(...)`), the parent establishes a localized CSS stacking context. Any nested `fixed` modal becomes trapped below sticky page headers (`<header className="sticky top-0 z-20">`).
3. **The Solution:** Always mount modals directly onto `document.body` via React's `createPortal(modal, document.body)` with `z-[999]` so the modal breaks completely out of parent stacking contexts and is never overlapped by headers or sidebars.

---

## 2. Standard 3-Zone Modal Template with `createPortal` & `z-[999]`

All inspection and details modals in SupportMSIS must follow the standard **`createPortal` + `z-[999]` + Fixed Header / Scrollable Body / Fixed Footer** architecture:

```tsx
import { createPortal } from 'react-dom';

{/* Render into document.body */}
{selectedTicket &&
  createPortal(
    <div
      className="fixed inset-0 z-[999] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      {/* Modal Card Frame */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] animate-fadeIn overflow-hidden">
        
        {/* ZONE 1: Fixed Header (Never scrolls or clips) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm sm:text-base font-bold text-red-600">
              #{ticket.id}
            </span>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* ZONE 2: Scrollable Body (Only middle content scrolls) */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Subject, description, technician commentary, attachments */}
        </div>

        {/* ZONE 3: Fixed Footer (Always visible action buttons) */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-2 shrink-0">
          <button onClick={closeModal} className="...">Close</button>
          <button onClick={markResolved} className="...">Mark as Resolved</button>
        </div>

      </div>
    </div>,
    document.body
  )}
```
