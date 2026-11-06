import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import southweLogo from '../../assets/logo/southwe_main.png';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import {
  SidebarExpandedSkeleton,
  SidebarCollapsedSkeleton,
  usePageSkeleton,
} from '../ui/skeleton';
import {
  Bell,
  LayoutGrid,
  Folder,
  ChevronRight,
  PlusCircle,
  Ticket,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  LogOut,
} from 'lucide-react';

interface AppSidebarProps {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
  activeNav?: string;
  onNavChange?: (nav: string) => void;
  ticketCounts: {
    total: number;
    student: number;
    faculty: number;
    secretary: number;
    admin: number;
  };
  isOpen: boolean;
  onToggle: () => void;
  roleSlug?: string;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentRole,
  activeNav: propActiveNav,
  onNavChange,
  ticketCounts,
  isOpen,
  onToggle,
  roleSlug: propRoleSlug,
}) => {
  const isLoading = usePageSkeleton(280);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHoverOverlayVisible, setIsHoverOverlayVisible] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { user, openLogoutModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const roleSlug =
    propRoleSlug ||
    (currentRole === 'Super Admin'
      ? 'super-admin'
      : currentRole.toLowerCase());

  // Determine active item from current route or fallback to prop
  const currentPath = location.pathname;
  const isDashboardActive =
    propActiveNav === 'dashboard' ||
    currentPath.endsWith(`/${roleSlug}/dashboard`) ||
    currentPath === `/${roleSlug}`;
  const isSubmitActive =
    propActiveNav === 'submit-ticket' ||
    currentPath.endsWith(`/${roleSlug}/submit`);
  const isTicketsActive =
    propActiveNav === 'my-tickets' ||
    propActiveNav === 'all-tickets' ||
    currentPath.endsWith(`/${roleSlug}/tickets`) ||
    currentPath.includes('tickets');
  const isActivityActive =
    propActiveNav === 'activity' ||
    currentPath.endsWith(`/${roleSlug}/activity`);

  const handleMouseEnter = () => {
    if (!isOpen) {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setIsHoverOverlayVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isOpen) {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHoverOverlayVisible(false);
        setIsUserMenuOpen(false);
      }, 150);
    }
  };

  const navigateTo = (path: string, navKey: string) => {
    if (onNavChange) {
      onNavChange(navKey);
    }
    navigate(path);
    if (!isOpen) {
      setIsHoverOverlayVisible(false);
      setIsUserMenuOpen(false);
    }
  };

  const isSuperAdmin = currentRole === 'Super Admin';

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : isSuperAdmin
    ? 'SA'
    : currentRole.charAt(0) + 'U';

  const userFullName = user?.name || (isSuperAdmin ? 'Super Admin' : `MSIS ${currentRole}`);

  /* =========================================================================
     1. EXPANDED SIDEBAR CONTENT (w-64, No horizontal scroll, Clean & focused)
     ========================================================================= */
  const sidebarExpandedContent = (
    <div className="h-full flex flex-col justify-between p-3.5 bg-white text-slate-800 select-none overflow-x-hidden w-full max-w-full">
      <div className="space-y-4 overflow-x-hidden min-w-0">
        {/* Top Header: Southwestern University Logo + MSIS Support + Ticket Tracking System */}
        <div className="flex items-center justify-between gap-1.5 min-w-0 px-1 py-1">
          <div className="flex items-center space-x-2.5 overflow-hidden min-w-0">
            <img
              src={southweLogo}
              alt="Southwestern University PHINMA"
              className="h-10 w-10 object-contain shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-base sm:text-lg font-black text-red-600 tracking-tight leading-none whitespace-nowrap">
                MSIS Support
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-red-600 tracking-tight mt-1 truncate leading-tight">
                Ticket Tracking System
              </span>
            </div>
          </div>

          {/* Collapse / Pin Sidebar Button */}
          <button
            type="button"
            onClick={() => {
              if (!isOpen) {
                // If clicked while inside hover overlay, pin it open permanently
                onToggle();
                setIsHoverOverlayVisible(false);
              } else {
                onToggle();
              }
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
            title={isOpen ? "Collapse Sidebar to Icon Bar" : "Pin Sidebar Open (Expand)"}
          >
            {isOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4 text-red-600" />
            )}
          </button>
        </div>

        {/* Divider line gap between header and pages */}
        <div className="border-b border-slate-200/80 mx-1 my-1" />

        {/* Navigation Section */}
        <nav className="space-y-1 text-xs min-w-0">
          {/* 1. Dashboard Item (First) */}
          <button
            type="button"
            onClick={() => navigateTo(`/${roleSlug}/dashboard`, 'dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer min-w-0 ${
              isDashboardActive
                ? 'bg-red-50 text-red-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <LayoutGrid className="h-4 w-4 text-slate-500 shrink-0" />
              <span className="truncate">Dashboard</span>
            </div>
          </button>

          {/* 2 & 3. Submit and Track Tickets */}
          {isSuperAdmin ? (
            /* Super Admin Nav: Tracks all tickets */
            <div className="pt-0.5 min-w-0">
              <button
                type="button"
                onClick={() => navigateTo('/super-admin/tickets', 'all-tickets')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer min-w-0 ${
                  isTicketsActive
                    ? 'bg-red-50 text-red-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Folder className="h-4 w-4 text-red-600 shrink-0" />
                  <span className="truncate">All Tickets</span>
                </div>
                <span className="text-[10px] text-red-600 font-bold shrink-0">
                  {ticketCounts.total}
                </span>
              </button>
            </div>
          ) : (
            /* User Roles (Student, Faculty, Secretary, Admin): Submit and Track My Tickets */
            <div className="pt-0.5 space-y-1 min-w-0">
              {/* Submit Ticket */}
              <button
                type="button"
                onClick={() => navigateTo(`/${roleSlug}/submit`, 'submit-ticket')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer min-w-0 ${
                  isSubmitActive
                    ? 'bg-red-50 text-red-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <PlusCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <span className="truncate">Submit Ticket</span>
                </div>
              </button>

              {/* Track My Tickets */}
              <button
                type="button"
                onClick={() => navigateTo(`/${roleSlug}/tickets`, 'my-tickets')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer min-w-0 ${
                  isTicketsActive
                    ? 'bg-red-50 text-red-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Ticket className="h-4 w-4 text-slate-600 shrink-0" />
                  <span className="truncate">Track My Tickets</span>
                </div>
                <span className="text-[10px] font-bold text-red-600 shrink-0">
                  {ticketCounts[roleSlug as keyof typeof ticketCounts] ?? 0}
                </span>
              </button>
            </div>
          )}

          {/* 4. Activity Item (Below Dashboard, Submit, and Track) */}
          <button
            type="button"
            onClick={() => navigateTo(`/${roleSlug}/activity`, 'activity')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer min-w-0 ${
              isActivityActive
                ? 'bg-red-50 text-red-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <Bell className="h-4 w-4 text-red-600 shrink-0" />
              <span className="truncate">Activity</span>
            </div>
            <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs shrink-0">
              {ticketCounts.total}
            </span>
          </button>
        </nav>
      </div>

      {/* Bottom Area: User Profile Card & Settings / Log Out Popover */}
      <div className="pt-3 border-t border-slate-100 min-w-0">
        <div className="relative min-w-0">
          {/* Click backdrop to close user menu */}
          {isUserMenuOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsUserMenuOpen(false)}
            />
          )}

          {/* Settings & Logout Popover */}
          {isUserMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-xl z-50 animate-fadeIn space-y-1">
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigateTo(`/${roleSlug}/settings`, 'settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              >
                <Settings className="h-4 w-4 text-slate-500 shrink-0" />
                <span>Account Settings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  openLogoutModal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50/70 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-red-500 shrink-0" />
                <span>Log Out</span>
              </button>
            </div>
          )}

          {/* User Card Trigger */}
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`w-full p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-red-300 hover:bg-red-50/30 transition-all cursor-pointer flex items-center justify-between text-left group min-w-0 ${
              isUserMenuOpen ? 'ring-2 ring-red-500/20 border-red-400 bg-red-50/20' : ''
            }`}
          >
            <div className="flex items-center space-x-2.5 overflow-hidden min-w-0">
              <div className="relative shrink-0">
                <div className="h-8 w-8 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {userInitials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
                  ✓
                </span>
              </div>

              <div className="flex flex-col overflow-hidden min-w-0">
                <span className="text-xs font-bold text-slate-900 truncate group-hover:text-red-700 transition-colors">
                  {userFullName}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {user?.email || (isSuperAdmin ? 'admin@msis.edu' : `${currentRole.toLowerCase()}@msis.edu`)}
                </span>
              </div>
            </div>

            <ChevronRight
              className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                isUserMenuOpen ? '-rotate-90 text-red-600' : 'group-hover:translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  /* =========================================================================
     2. COLLAPSED MINI-RAIL SIDEBAR CONTENT (Icon indicators when collapsed)
     ========================================================================= */
  const sidebarCollapsedContent = (
    <div className="h-full w-full flex flex-col justify-between py-4 px-2 bg-white text-slate-800 select-none overflow-x-hidden items-center">
      <div className="flex flex-col items-center space-y-4 w-full">
        {/* Top Logo Button */}
        <button
          type="button"
          onClick={onToggle}
          className="h-10 w-10 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center shadow-xs hover:border-red-300 transition-all cursor-pointer relative group p-1"
          title="MSIS Support"
        >
          <img
            src={southweLogo}
            alt="MSIS"
            className="h-8 w-8 object-contain"
          />
        </button>

        {/* Collapsed Nav Icons */}
        <div className="w-full flex flex-col items-center space-y-2 pt-2 border-t border-slate-100">
          {/* 1. Dashboard Icon (First) */}
          <button
            type="button"
            onClick={() => navigateTo(`/${roleSlug}/dashboard`, 'dashboard')}
            className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isDashboardActive
                ? 'bg-red-50 text-red-600 font-bold ring-2 ring-red-500/20'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title="Dashboard Overview"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>

          {/* 2. Submit Ticket Icon */}
          {!isSuperAdmin && (
            <button
              type="button"
              onClick={() => navigateTo(`/${roleSlug}/submit`, 'submit-ticket')}
              className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isSubmitActive
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-red-600 hover:bg-red-50'
              }`}
              title="Submit Ticket"
            >
              <PlusCircle className="h-4 w-4" />
            </button>
          )}

          {/* 3. All Tickets / My Tickets Icon */}
          <button
            type="button"
            onClick={() => navigateTo(isSuperAdmin ? '/super-admin/tickets' : `/${roleSlug}/tickets`, isSuperAdmin ? 'all-tickets' : 'my-tickets')}
            className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isTicketsActive
                ? 'bg-red-50 text-red-600 font-bold ring-2 ring-red-500/20'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title={isSuperAdmin ? `All Tickets (${ticketCounts.total})` : 'Track My Tickets'}
          >
            {isSuperAdmin ? <Folder className="h-4 w-4" /> : <Ticket className="h-4 w-4" />}
          </button>

          {/* 4. Activity Icon (Below) */}
          <button
            type="button"
            onClick={() => navigateTo(`/${roleSlug}/activity`, 'activity')}
            className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
              isActivityActive
                ? 'bg-red-50 text-red-600 font-bold ring-2 ring-red-500/20'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title={`Activity (${ticketCounts.total} tickets)`}
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
          </button>
        </div>
      </div>

      {/* Bottom Collapsed: User Avatar with Settings Popover */}
      <div className="w-full flex flex-col items-center pt-3 border-t border-slate-100 relative">
        <div className="relative">
          {/* Click backdrop to close user menu */}
          {isUserMenuOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsUserMenuOpen(false)}
            />
          )}

          {/* Popover Menu for Collapsed Rail */}
          {isUserMenuOpen && (
            <div className="absolute left-full bottom-0 ml-3 w-56 p-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xl z-50 animate-fadeIn space-y-1">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {userFullName}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {user?.email || (isSuperAdmin ? 'admin@msis.edu' : `${currentRole.toLowerCase()}@msis.edu`)}
                </div>
                <div className="mt-1">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 text-red-700">
                    {currentRole}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigateTo(`/${roleSlug}/settings`, 'settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              >
                <Settings className="h-4 w-4 text-slate-500 shrink-0" />
                <span>Account Settings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  openLogoutModal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50/70 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-red-500 shrink-0" />
                <span>Log Out</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="relative cursor-pointer group hover:scale-105 active:scale-95 transition-transform"
            title={`${isSuperAdmin ? 'Super Admin' : currentRole} - Click for Settings / Logout`}
          >
            <div className="h-9 w-9 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {userInitials}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 text-white text-[7px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              ✓
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Docked Sidebar Container (Shown on lg and above; md and sm use BottomNav) */}
      <div
        className="hidden lg:block shrink-0 relative h-screen sticky top-0 z-50"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <aside
          className={`bg-white border-r border-slate-200/80 flex flex-col h-screen overflow-y-auto overflow-x-hidden transition-all duration-300 ${
            isOpen ? 'w-64' : 'w-[72px]'
          }`}
        >
          <div className="w-full h-full overflow-x-hidden">
            {isLoading ? (
              isOpen ? <SidebarExpandedSkeleton /> : <SidebarCollapsedSkeleton />
            ) : (
              isOpen ? sidebarExpandedContent : sidebarCollapsedContent
            )}
          </div>
        </aside>

        {/* Smooth Floating Overlay Display when Hovering over Collapsed Rail */}
        <AnimatePresence>
          {!isOpen && isHoverOverlayVisible && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 bg-slate-950/20 backdrop-blur-[2px] pointer-events-none z-40"
              />

              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute top-0 left-0 w-64 h-screen bg-white shadow-2xl border-r border-slate-200/90 z-50 overflow-y-auto overflow-x-hidden"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {sidebarExpandedContent}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default AppSidebar;
