import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { UserRole } from '../../types';
import {
  LayoutGrid,
  Ticket,
  Folder,
  Plus,
  Bell,
  Settings,
} from 'lucide-react';

interface BottomNavProps {
  currentRole: UserRole;
  roleSlug: string;
  ticketCounts: {
    total: number;
    student: number;
    faculty: number;
    secretary: number;
    admin: number;
  };
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentRole,
  roleSlug,
  ticketCounts,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const isSuperAdmin = currentRole === 'Super Admin';

  const isDashboardActive =
    currentPath.endsWith(`/${roleSlug}/dashboard`) || currentPath === `/${roleSlug}`;
  const isTicketsActive =
    currentPath.endsWith(`/${roleSlug}/tickets`) || currentPath.includes('tickets');
  const isSubmitActive = currentPath.endsWith(`/${roleSlug}/submit`);
  const isActivityActive = currentPath.endsWith(`/${roleSlug}/activity`);
  const isSettingsActive = currentPath.endsWith(`/${roleSlug}/settings`);

  return (
    <div className="lg:hidden fixed bottom-3 inset-x-0 z-40 flex justify-center px-3 sm:px-4 pointer-events-none select-none animate-slideUp">
      <nav
        aria-label="Mobile Bottom Navigation"
        className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_10px_32px_rgba(0,0,0,0.14)] rounded-3xl px-3 sm:px-6 py-1.5 flex items-end justify-between gap-2 sm:gap-6 max-w-md w-full"
      >
        {/* 1. Dashboard */}
        <button
          type="button"
          onClick={() => navigate(`/${roleSlug}/dashboard`)}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer group"
          title="Dashboard"
        >
          <LayoutGrid
            className={`h-5 w-5 transition-colors ${
              isDashboardActive
                ? 'text-red-600'
                : 'text-slate-400 group-hover:text-slate-600'
            }`}
          />
          <span
            className={`text-[9px] sm:text-[10px] tracking-tight whitespace-nowrap transition-colors mt-0.5 ${
              isDashboardActive
                ? 'text-red-600 font-bold'
                : 'text-slate-400 group-hover:text-slate-600 font-medium'
            }`}
          >
            Dashboard
          </span>
          <span
            className={`h-1 w-1 rounded-full mt-0.5 transition-all ${
              isDashboardActive ? 'bg-red-600 scale-100' : 'bg-transparent scale-0'
            }`}
          />
        </button>

        {/* 2. Track Tickets */}
        <button
          type="button"
          onClick={() =>
            navigate(isSuperAdmin ? '/super-admin/tickets' : `/${roleSlug}/tickets`)
          }
          className="flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer group"
          title={isSuperAdmin ? 'All Tickets' : 'Track Tickets'}
        >
          {isSuperAdmin ? (
            <Folder
              className={`h-5 w-5 transition-colors ${
                isTicketsActive
                  ? 'text-red-600'
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
          ) : (
            <Ticket
              className={`h-5 w-5 transition-colors ${
                isTicketsActive
                  ? 'text-red-600'
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
          )}
          <span
            className={`text-[9px] sm:text-[10px] tracking-tight whitespace-nowrap transition-colors mt-0.5 ${
              isTicketsActive
                ? 'text-red-600 font-bold'
                : 'text-slate-400 group-hover:text-slate-600 font-medium'
            }`}
          >
            {isSuperAdmin ? 'Tickets' : 'Track'}
          </span>
          <span
            className={`h-1 w-1 rounded-full mt-0.5 transition-all ${
              isTicketsActive ? 'bg-red-600 scale-100' : 'bg-transparent scale-0'
            }`}
          />
        </button>

        {/* 3. Center Elevated Action: Submit Ticket */}
        <div className="flex-1 flex flex-col items-center -mt-6">
          <button
            type="button"
            onClick={() =>
              navigate(isSuperAdmin ? '/super-admin/tickets' : `/${roleSlug}/submit`)
            }
            className={`h-12 w-12 rounded-full flex items-center justify-center border-4 border-white shadow-[0_8px_20px_rgba(220,38,38,0.35)] transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              isSubmitActive
                ? 'bg-red-700 text-white ring-2 ring-red-500/30'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
            title="Submit Ticket"
          >
            <Plus className="h-6 w-6 text-white stroke-[2.8]" />
          </button>
          <span
            className={`text-[9px] sm:text-[10px] tracking-tight whitespace-nowrap transition-colors mt-0.5 ${
              isSubmitActive
                ? 'text-red-600 font-bold'
                : 'text-slate-600 font-semibold'
            }`}
          >
            Submit
          </span>
          <span
            className={`h-1 w-1 rounded-full mt-0.5 transition-all ${
              isSubmitActive ? 'bg-red-600 scale-100' : 'bg-transparent scale-0'
            }`}
          />
        </div>

        {/* 4. Activity */}
        <button
          type="button"
          onClick={() => navigate(`/${roleSlug}/activity`)}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer group relative"
          title="Activity"
        >
          <div className="relative">
            <Bell
              className={`h-5 w-5 transition-colors ${
                isActivityActive
                  ? 'text-red-600'
                  : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
            {ticketCounts.total > 0 && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
            )}
          </div>
          <span
            className={`text-[9px] sm:text-[10px] tracking-tight whitespace-nowrap transition-colors mt-0.5 ${
              isActivityActive
                ? 'text-red-600 font-bold'
                : 'text-slate-400 group-hover:text-slate-600 font-medium'
            }`}
          >
            Activity
          </span>
          <span
            className={`h-1 w-1 rounded-full mt-0.5 transition-all ${
              isActivityActive ? 'bg-red-600 scale-100' : 'bg-transparent scale-0'
            }`}
          />
        </button>

        {/* 5. Settings */}
        <button
          type="button"
          onClick={() => navigate(`/${roleSlug}/settings`)}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer group"
          title="Settings"
        >
          <Settings
            className={`h-5 w-5 transition-colors ${
              isSettingsActive
                ? 'text-red-600'
                : 'text-slate-400 group-hover:text-slate-600'
            }`}
          />
          <span
            className={`text-[9px] sm:text-[10px] tracking-tight whitespace-nowrap transition-colors mt-0.5 ${
              isSettingsActive
                ? 'text-red-600 font-bold'
                : 'text-slate-400 group-hover:text-slate-600 font-medium'
            }`}
          >
            Settings
          </span>
          <span
            className={`h-1 w-1 rounded-full mt-0.5 transition-all ${
              isSettingsActive ? 'bg-red-600 scale-100' : 'bg-transparent scale-0'
            }`}
          />
        </button>
      </nav>
    </div>
  );
};

export default BottomNav;
