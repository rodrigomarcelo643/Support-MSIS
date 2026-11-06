# 02 • Component Hierarchy & Composition

## 1. Composition Architecture

SupportMSIS follows an explicit composition hierarchy to guarantee layout stability:

```mermaid
graph TD
    App[App.tsx Root] --> AuthProvider[AuthProvider]
    AuthProvider --> TicketsProvider[TicketsProvider]
    TicketsProvider --> Router[BrowserRouter]
    
    Router --> PublicPage[PublicPage.tsx]
    Router --> LoginPage[LoginPage.tsx]
    Router --> ProtectedRoute[ProtectedRoute Guard]
    
    ProtectedRoute --> DashboardLayout[DashboardLayout.tsx]
    
    DashboardLayout --> AppSidebar[AppSidebar.tsx - Fixed Desktop Sidebar]
    DashboardLayout --> Header[Top Mobile Header & Brand]
    DashboardLayout --> MainContent[Main Content Outlet]
    DashboardLayout --> BottomNav[BottomNav.tsx - Mobile Navigation]
    
    MainContent --> PageView[Role Routed Page, e.g. StudentTrackTicketsPage]
    PageView --> TrackTicketsList[TrackTicketsList.tsx]
    TrackTicketsList --> FilterBar[Status Select & Search Bar]
    TrackTicketsList --> TableCard[Table Card + Pagination Controls]
    TrackTicketsList --> DetailsModal[Fixed Header & Scrollable Body Modal]
```

---

## 2. Layout Wrapper Rules

- **Desktop (`>= md`):**
  - Desktop sidebar is rendered as `fixed top-0 bottom-0 left-0 z-30 h-screen`.
  - Main container reserves a placeholder offset (`w-64` or `w-[72px]` when collapsed) so that scrolling the page content never shifts or un-pins the navigation sidebar.
- **Mobile (`< md`):**
  - Desktop sidebar is hidden (`hidden md:flex`).
  - Mobile bottom nav is fixed (`fixed bottom-0 left-0 right-0 z-40`).
  - Main view container applies bottom padding (`pb-24`) so bottom navigation buttons never obscure table pagination controls or action buttons.
