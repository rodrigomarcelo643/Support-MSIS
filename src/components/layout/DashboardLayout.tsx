import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { BottomNav } from './BottomNav';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../context/TicketsContext';
import type { UserRole } from '../../types';
import { Bell } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const { ticketCounts } = useTickets();
  const navigate = useNavigate();

  // Active Role from user auth
  const currentRole: UserRole =
    user?.role && (['Admin', 'Faculty', 'Student', 'Secretary', 'Super Admin'] as string[]).includes(user.role)
      ? (user.role as UserRole)
      : 'Admin';

  const roleSlug =
    currentRole === 'Super Admin'
      ? 'super-admin'
      : currentRole.toLowerCase();

  // Persistent Sidebar State in localStorage
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('msis_sidebar_open');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('msis_sidebar_open', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] flex text-slate-800 antialiased font-sans">
      {/* 1. Responsive Sidebar with dynamic role-based routes */}
      <AppSidebar
        currentRole={currentRole}
        roleSlug={roleSlug}
        ticketCounts={ticketCounts}
        isOpen={isSidebarOpen}
        onToggle={handleToggleSidebar}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200/80 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 sticky top-0 z-20 flex items-center justify-between gap-2 sm:gap-4 shadow-xs">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="whitespace-nowrap">MSIS Support</span>
              <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 whitespace-nowrap shrink-0">
                {currentRole}
              </span>
            </h1>
          </div>

          <div className="flex items-center shrink-0">
            {/* Notification Bell (Only element remaining on header right) */}
            <button
              type="button"
              onClick={() => navigate(`/${roleSlug}/activity`)}
              className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
              title="Activity & Notifications"
            >
              <Bell className="h-4 w-4" />
              {ticketCounts.total > 0 && (
                <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
              )}
            </button>
          </div>
        </header>

        {/* Main Routed Content */}
        <main className="p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto pb-24 sm:pb-28 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Floating Bottom Navigation on md and sm (Hidden on lg desktop) */}
      <BottomNav
        currentRole={currentRole}
        roleSlug={roleSlug}
        ticketCounts={ticketCounts}
      />
    </div>
  );
};

export default DashboardLayout;
