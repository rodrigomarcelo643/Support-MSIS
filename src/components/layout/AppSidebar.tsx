import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import medicineLogo from '../../assets/logo/medicine-logo.png';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import {
  Bell,
  LayoutGrid,
  Folder,
  ChevronDown,
  ChevronUp,
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
  onRoleChange: (role: UserRole) => void;
  activeNav: string;
  onNavChange: (nav: string) => void;
  ticketCounts: {
    total: number;
    student: number;
    faculty: number;
    secretary: number;
    admin: number;
  };
  isOpen: boolean;
  onToggle: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentRole,
  onRoleChange,
  activeNav,
  onNavChange,
  ticketCounts,
  isOpen,
  onToggle,
}) => {
  const [isTicketsExpanded, setIsTicketsExpanded] = useState(true);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHoverOverlayVisible, setIsHoverOverlayVisible] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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

  const handleNavSelect = (nav: string) => {
    onNavChange(nav);
    if (!isOpen) {
      setIsHoverOverlayVisible(false);
      setIsUserMenuOpen(false);
    }
  };

  const isSuperAdmin = currentRole === 'Super Admin';

  const roleLabels: Record<UserRole, { label: string; roleType: string }> = {
    'Super Admin': { label: 'MSIS Central', roleType: 'Super Admin Core' },
    Faculty: { label: 'MSIS Faculty', roleType: 'Academic • Faculty' },
    Student: { label: 'MSIS Student', roleType: 'Student Portal' },
    Secretary: { label: 'MSIS Staff', roleType: 'Department • Secretary' },
    Admin: { label: 'MSIS Admin', roleType: 'Administrative Staff' },
  };

  /* =========================================================================
     1. EXPANDED SIDEBAR CONTENT (w-64, No horizontal scroll, Clean & focused)
     ========================================================================= */
  const sidebarExpandedContent = (
    <div className="h-full flex flex-col justify-between p-3.5 bg-white text-slate-800 select-none overflow-x-hidden w-full max-w-full">
      <div className="space-y-4 overflow-x-hidden min-w-0">
        {/* Top Header Card with Blue Branding & Collapse Button */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="relative flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="w-full flex items-center justify-between p-2 rounded-2xl bg-white hover:bg-blue-50/50 border border-slate-200/90 transition-all cursor-pointer shadow-xs text-left min-w-0"
            >
              <div className="flex items-center space-x-2.5 overflow-hidden min-w-0">
                <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center p-1.5 shrink-0 shadow-xs shadow-blue-500/20">
                  <img
                    src={medicineLogo}
                    alt="MSIS"
                    className="h-full w-auto object-contain brightness-110"
                  />
                </div>
                <div className="flex flex-col overflow-hidden min-w-0">
                  <span className="text-xs font-bold text-slate-900 truncate tracking-tight">
                    {roleLabels[currentRole].label}
                  </span>
                  <span className="text-[10px] text-blue-600 font-medium truncate">
                    {roleLabels[currentRole].roleType}
                  </span>
                </div>
              </div>
              <ChevronRight
                className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${
                  isRoleDropdownOpen ? 'rotate-90' : ''
                }`}
              />
            </button>

            {/* Role Switcher Popover */}
            {isRoleDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 space-y-1 animate-fadeIn">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                  Switch Active Role
                </span>
                {(['Super Admin', 'Faculty', 'Student', 'Secretary', 'Admin'] as UserRole[]).map(
                  (role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        onRoleChange(role);
                        setIsRoleDropdownOpen(false);
                        if (role === 'Super Admin') {
                          handleNavSelect('all-tickets');
                        } else {
                          handleNavSelect('my-tickets');
                        }
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                        currentRole === role
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span>{role}</span>
                      {currentRole === role && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      )}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Collapse / Pin Sidebar Button */}
          <button
            type="button"
            onClick={() => {
              if (!isOpen) {
                // If clicked while inside hover overlay, pin it open permanently!
                onToggle();
                setIsHoverOverlayVisible(false);
              } else {
                onToggle();
              }
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0 cursor-pointer"
            title={isOpen ? "Collapse Sidebar to Icon Bar" : "Pin Sidebar Open"}
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1 text-xs min-w-0">
          {/* Activity Item with Blue pill badge */}
          <button
            type="button"
            onClick={() => handleNavSelect('activity')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer min-w-0 ${
              activeNav === 'activity'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <Bell className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="truncate">Activity</span>
            </div>
            <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs shrink-0">
              {ticketCounts.total}
            </span>
          </button>

          {/* Dashboard Item */}
          <button
            type="button"
            onClick={() => handleNavSelect('dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer min-w-0 ${
              activeNav === 'dashboard'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <LayoutGrid className="h-4 w-4 text-slate-500 shrink-0" />
              <span className="truncate">Dashboard</span>
            </div>
          </button>

          {/* Super Admin Nav: Tracks all tickets categorized */}
          {isSuperAdmin ? (
            <div className="pt-1 min-w-0">
              <button
                type="button"
                onClick={() => setIsTicketsExpanded(!isTicketsExpanded)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-900 font-bold hover:bg-slate-50 cursor-pointer transition-colors min-w-0"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Folder className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="truncate">All Tickets</span>
                </div>
                {isTicketsExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                )}
              </button>

              {/* Sub-menu with signature lime/lemon highlight pill */}
              {isTicketsExpanded && (
                <div className="pl-6 pr-1 py-1 space-y-1 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-blue-100 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleNavSelect('all-tickets')}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all truncate ${
                      activeNav === 'all-tickets'
                        ? 'bg-[#f4fa74] text-slate-950 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    Overview ({ticketCounts.total})
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavSelect('student-tickets')}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all min-w-0 ${
                      activeNav === 'student-tickets'
                        ? 'bg-[#f4fa74] text-slate-950 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">Student</span>
                    <span className="text-[10px] text-blue-600 font-bold shrink-0">
                      {ticketCounts.student}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavSelect('faculty-tickets')}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all min-w-0 ${
                      activeNav === 'faculty-tickets'
                        ? 'bg-[#f4fa74] text-slate-950 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">Faculty</span>
                    <span className="text-[10px] text-blue-600 font-bold shrink-0">
                      {ticketCounts.faculty}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavSelect('secretary-tickets')}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all min-w-0 ${
                      activeNav === 'secretary-tickets'
                        ? 'bg-[#f4fa74] text-slate-950 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">Secretary</span>
                    <span className="text-[10px] text-blue-600 font-bold shrink-0">
                      {ticketCounts.secretary}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavSelect('admin-tickets')}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all min-w-0 ${
                      activeNav === 'admin-tickets'
                        ? 'bg-[#f4fa74] text-slate-950 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">Admin</span>
                    <span className="text-[10px] text-blue-600 font-bold shrink-0">
                      {ticketCounts.admin}
                    </span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* User Roles (Student, Faculty, Secretary, Admin): Can submit and track their own */
            <div className="pt-1 space-y-1 min-w-0">
              <button
                type="button"
                onClick={() => handleNavSelect('submit-ticket')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer min-w-0 ${
                  activeNav === 'submit-ticket'
                    ? 'bg-[#f4fa74] text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <PlusCircle className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="truncate">Submit New Bug</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold shrink-0">
                  {currentRole}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleNavSelect('my-tickets')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer min-w-0 ${
                  activeNav === 'my-tickets'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Ticket className="h-4 w-4 text-slate-600 shrink-0" />
                  <span className="truncate">Track My Tickets</span>
                </div>
              </button>
            </div>
          )}
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

          {/* Popover Menu for Settings or Log Out */}
          {isUserMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-xl z-50 animate-fadeIn space-y-1">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between min-w-0">
                <div className="overflow-hidden pr-2 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {user?.name || (isSuperAdmin ? 'Super Admin' : `MSIS ${currentRole}`)}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {user?.email || (isSuperAdmin ? 'admin@msis.edu' : `${currentRole.toLowerCase()}@msis.edu`)}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 shrink-0">
                  {currentRole}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  handleNavSelect('settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50/70 rounded-xl transition-colors cursor-pointer"
              >
                <Settings className="h-4 w-4 text-slate-500 shrink-0" />
                <span>Settings</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsUserMenuOpen(false);
                  await signOut();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50/70 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-red-500 shrink-0" />
                <span>Log Out</span>
              </button>
            </div>
          )}

          {/* User Card Trigger (Resolution target completely removed) */}
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`w-full p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-between text-left group min-w-0 ${
              isUserMenuOpen ? 'ring-2 ring-blue-500/20 border-blue-400 bg-blue-50/20' : ''
            }`}
          >
            <div className="flex items-center space-x-2.5 overflow-hidden min-w-0">
              <div className="relative shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {isSuperAdmin ? 'SA' : currentRole.charAt(0) + 'U'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
                  ✓
                </span>
              </div>

              <div className="flex flex-col overflow-hidden min-w-0">
                <span className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                  {isSuperAdmin ? 'Super Admin' : `MSIS ${currentRole}`}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {isSuperAdmin ? 'admin@msis.edu' : `${currentRole.toLowerCase()}@msis.edu`}
                </span>
              </div>
            </div>

            <ChevronRight
              className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                isUserMenuOpen ? '-rotate-90 text-blue-600' : 'group-hover:translate-x-0.5'
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
        {/* Expand Sidebar Trigger Button */}
        <button
          type="button"
          onClick={onToggle}
          className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer relative group"
          title="Expand Sidebar (MSIS)"
        >
          <img
            src={medicineLogo}
            alt="MSIS"
            className="h-6 w-auto object-contain brightness-125"
          />
        </button>

        {/* Small Expand Indicator */}
        <button
          type="button"
          onClick={onToggle}
          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
          title="Expand Sidebar"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>

        {/* Collapsed Nav Icons */}
        <div className="w-full flex flex-col items-center space-y-2 pt-2 border-t border-slate-100">
          {/* Activity Icon */}
          <button
            type="button"
            onClick={() => handleNavSelect('activity')}
            className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
              activeNav === 'activity'
                ? 'bg-blue-50 text-blue-600 font-bold ring-2 ring-blue-500/20'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title={`Activity (${ticketCounts.total} tickets)`}
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {/* Dashboard Icon */}
          <button
            type="button"
            onClick={() => handleNavSelect('dashboard')}
            className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeNav === 'dashboard'
                ? 'bg-blue-50 text-blue-600 font-bold ring-2 ring-blue-500/20'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title="Dashboard Overview"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>

          {/* All Tickets / My Tickets Icon */}
          <button
            type="button"
            onClick={() => handleNavSelect(isSuperAdmin ? 'all-tickets' : 'my-tickets')}
            className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeNav.includes('tickets') || activeNav === 'my-tickets'
                ? 'bg-[#f4fa74] text-slate-950 font-bold shadow-xs'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title={isSuperAdmin ? `All Tickets (${ticketCounts.total})` : 'Track My Tickets'}
          >
            {isSuperAdmin ? <Folder className="h-4 w-4" /> : <Ticket className="h-4 w-4" />}
          </button>

          {/* User Submit Bug Icon */}
          {!isSuperAdmin && (
            <button
              type="button"
              onClick={() => handleNavSelect('submit-ticket')}
              className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activeNav === 'submit-ticket'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
              title="Submit New Bug Report"
            >
              <PlusCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Collapsed: User Avatar with Settings Popover */}
      <div className="w-full flex flex-col items-center pt-3 border-t border-slate-100 relative">
        {/* User Avatar Trigger in Collapsed Rail */}
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
                  {user?.name || (isSuperAdmin ? 'Super Admin' : `MSIS ${currentRole}`)}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {user?.email || (isSuperAdmin ? 'admin@msis.edu' : `${currentRole.toLowerCase()}@msis.edu`)}
                </div>
                <div className="mt-1">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {currentRole}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  handleNavSelect('settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50/70 rounded-xl transition-colors cursor-pointer"
              >
                <Settings className="h-4 w-4 text-slate-500" />
                <span>Settings</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsUserMenuOpen(false);
                  await signOut();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50/70 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-red-500" />
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
            <div className="h-9 w-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {isSuperAdmin ? 'SA' : currentRole.charAt(0) + 'U'}
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
      {/* 1. Desktop Docked Sidebar Container (z-50: Always stays above header so it is NEVER overlapped) */}
      <div
        className="hidden md:block shrink-0 relative h-screen sticky top-0 z-50"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Base Docked Rail / Sidebar:
            When isOpen: w-64 full expanded
            When !isOpen: w-[72px] collapsed icon rail indicator */}
        <aside
          className={`bg-white border-r border-slate-200/80 flex flex-col h-screen overflow-y-auto overflow-x-hidden transition-all duration-300 ${
            isOpen ? 'w-64' : 'w-[72px]'
          }`}
        >
          <div className="w-full h-full overflow-x-hidden">
            {isOpen ? sidebarExpandedContent : sidebarCollapsedContent}
          </div>
        </aside>

        {/* Smooth Floating Overlay Display when Hovering over Collapsed Rail */}
        <AnimatePresence>
          {!isOpen && isHoverOverlayVisible && (
            <>
              {/* Soft frosted backdrop tint over page */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 bg-blue-950/15 backdrop-blur-[2px] pointer-events-none z-40"
              />

              {/* Floating Full Sidebar Overlay with smooth slide & fade */}
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

      {/* 2. Responsive Mobile Drawer (Overlay when open, hidden when closed) */}
      <div className="md:hidden">
        {isOpen && (
          <div className="fixed inset-0 z-50 flex animate-fadeIn">
            {/* Soft subtle blue-tinted backdrop */}
            <div
              className="fixed inset-0 bg-blue-950/20 backdrop-blur-xs transition-opacity cursor-pointer"
              onClick={onToggle}
              title="Click to close sidebar"
            />
            <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl border-r border-slate-200 flex flex-col z-10 animate-slideRight overflow-x-hidden">
              <div className="flex-1 overflow-y-auto overflow-x-hidden">{sidebarExpandedContent}</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AppSidebar;
