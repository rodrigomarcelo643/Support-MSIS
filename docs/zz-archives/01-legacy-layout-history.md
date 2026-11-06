# 01 • Legacy Layout History & Technical Retrospectives

## 1. Evolution of the Ticket Tracking Layout

### Iteration 1: Static Indicator Badges
- **Original Implementation:** Each ticket displayed a static pulsating status point (`Clock`, `AlertCircle`, `CheckCircle`).
- **Limitation:** Users and technicians could not interactively update the triage status directly from the tracking view.
- **Resolution:** Replaced static points with interactive `<select>` dropdowns tied directly to `updateTicketStatus()`.

### Iteration 2: Accidental Outer Flex Wrapper
- **Issue:** An accidental `sm:flex-row items-center justify-between` container wrapped both the search/filter header and the table card together.
- **Symptom:** On desktop screens, the search bar and the table were rendered inline side-by-side instead of stacking vertically.
- **Resolution:** Removed the outer flex container, establishing a dedicated selection bar above and a full-width table card below.

### Iteration 3: Modal Header Clipping
- **Issue:** Modal dialog used `overflow-y-auto` across the entire card container with `p-4 sm:p-6`.
- **Symptom:** When the modal opened, the header (`#TK-XXXX` and `✕`) was scrolled upward and sliced off by the top rounded corners.
- **Resolution:** Implemented the 3-zone architecture with a non-scrolling fixed header, isolated scrollable body, and pinned action footer.
