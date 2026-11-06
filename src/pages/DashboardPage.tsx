import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppSidebar } from '../components/layout/AppSidebar';
import { SuperAdminView } from '../components/dashboard/SuperAdminView';
import { UserRoleView } from '../components/dashboard/UserRoleView';
import { Card } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../context/TicketsContext';
import type { SupportTicket, UserRole } from '../types';
import type { UploadedFile } from '../components/ui/file-upload';
import {
  Bell,
  LogOut,
  Eye,
  CheckCircle,
  GraduationCap,
  ShieldAlert,
  Settings as SettingsIcon,
  User as UserIcon,
  Check
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Active Role in the Portal (Defaults to detected role from database)
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    if (user?.role && (['Admin', 'Faculty', 'Student', 'Secretary', 'Super Admin'] as string[]).includes(user.role)) {
      return user.role as UserRole;
    }
    return 'Admin';
  });
  const [activeNav, setActiveNav] = useState<string>(() => {
    if (user?.role === 'Super Admin') return 'all-tickets';
    return 'my-tickets';
  });

  React.useEffect(() => {
    if (user?.role && (['Admin', 'Faculty', 'Student', 'Secretary', 'Super Admin'] as string[]).includes(user.role)) {
      setCurrentRole(user.role as UserRole);
      if (user.role === 'Super Admin') {
        setActiveNav('all-tickets');
      } else {
        setActiveNav('my-tickets');
      }
    }
  }, [user?.role]);

  // Persistent Sidebar State in localStorage (Stored collapse state)
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

  // Dynamic tickets state shared across the application from MySQL database
  const {
    tickets,
    ticketCounts,
    submitTicket,
    updateTicketStatus,
    deleteTicket,
  } = useTickets();

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (newRole === 'Super Admin') {
      setActiveNav('all-tickets');
    } else {
      setActiveNav('my-tickets');
    }
  };

  const handleStatusChange = (ticketId: string, newStatus: SupportTicket['status']) => {
    updateTicketStatus(ticketId, newStatus);
  };

  const handleDeleteTicket = (ticketId: string) => {
    deleteTicket(ticketId);
  };

  const handleUserSubmitTicket = async (data: {
    subject: string;
    description: string;
    files: UploadedFile[];
    department?: string;
  }) => {
    await submitTicket({
      subject: data.subject,
      description: data.description,
      files: data.files,
      department: data.department,
      category: (currentRole === 'Super Admin' ? 'Admin' : currentRole) as 'Student' | 'Faculty' | 'Secretary' | 'Admin',
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] flex text-slate-800 antialiased font-sans">
      {/* 1. Responsive Sidebar (Can open & collapse, overlay on all screens when collapsed) */}
      <AppSidebar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        activeNav={activeNav}
        onNavChange={(nav) => setActiveNav(nav)}
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
              onClick={() => setActiveNav('activity')}
              className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
              title="Activity & Notifications"
            >
              <Bell className="h-4 w-4" />
              {tickets.length > 0 && (
                <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
              )}
            </button>
          </div>
        </header>

        {/* Main Content Render Area */}
        <main className="p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto pb-24 sm:pb-28 lg:pb-8">
          {/* A. If Super Admin: Render SuperAdminView (Tracks all tickets categorized, cannot submit report) */}
          {currentRole === 'Super Admin' &&
            activeNav !== 'dashboard' &&
            activeNav !== 'activity' &&
            activeNav !== 'settings' && (
              <SuperAdminView
                tickets={tickets}
                onStatusChange={handleStatusChange}
                activeFilterRole={
                  activeNav.includes('-tickets')
                    ? activeNav.replace('-tickets', '')
                    : 'all'
                }
                onFilterRoleChange={(role) => {
                  if (role === 'all') {
                    setActiveNav('all-tickets');
                  } else {
                    setActiveNav(`${role}-tickets`);
                  }
                }}
              />
            )}

          {/* B. If User Role (Faculty, Student, Secretary, Admin): Render UserRoleView (Submit & Track Own) */}
          {currentRole !== 'Super Admin' &&
            activeNav !== 'dashboard' &&
            activeNav !== 'activity' &&
            activeNav !== 'settings' && (
              <UserRoleView
                currentRole={currentRole}
                tickets={tickets}
                onSubmitTicket={handleUserSubmitTicket}
                activeNav={activeNav}
                onNavChange={setActiveNav}
                onStatusChange={handleStatusChange}
                onDeleteTicket={handleDeleteTicket}
              />
            )}

          {/* C. Settings View */}
          {activeNav === 'settings' && (
            <div className="space-y-6 max-w-4xl animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5 text-red-600" />
                    <span>Account & System Settings</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage your MSIS institutional profile, notifications, and preferences.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveNav(currentRole === 'Super Admin' ? 'all-tickets' : 'my-tickets')}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
                >
                  ← Back to Tickets
                </button>
              </div>

              {/* Profile Card */}
              <Card variant="default" className="bg-white border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <UserIcon className="h-4 w-4 text-red-600" />
                  <span>Profile Information</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-red-600 text-white font-extrabold text-lg flex items-center justify-center shadow-xs">
                    {currentRole === 'Super Admin' ? 'SA' : currentRole.charAt(0) + 'U'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {user?.name || (currentRole === 'Super Admin' ? 'Super Administrator' : `Alex Morgan (${currentRole})`)}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {user?.email || (currentRole === 'Super Admin' ? 'admin@msis.edu' : `${currentRole.toLowerCase()}@msis.edu`)}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                        {currentRole}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                        <Check className="h-3 w-3" /> Institutional Google Verified
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Department</span>
                    <span className="text-xs font-semibold text-slate-800">Medical Systems & Information Services</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Permissions Scope</span>
                    <span className="text-xs font-semibold text-slate-800">
                      {currentRole === 'Super Admin' ? 'Full Ticket Tracking & Audit Console' : 'Submit & Track Role Tickets'}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Notification Preferences */}
              <Card variant="default" className="bg-white border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Bell className="h-4 w-4 text-red-600" />
                  <span>Notification Preferences</span>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-red-50/40 transition-colors cursor-pointer border border-slate-100">
                    <div className="pr-4">
                      <span className="text-xs font-bold text-slate-800 block">Email Alerts on Status Updates</span>
                      <span className="text-[11px] text-slate-500">Receive an email when your ticket is marked Investigating or Resolved</span>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-red-600 rounded cursor-pointer accent-red-600" />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-red-50/40 transition-colors cursor-pointer border border-slate-100">
                    <div className="pr-4">
                      <span className="text-xs font-bold text-slate-800 block">Critical System Outages</span>
                      <span className="text-[11px] text-slate-500">Immediate notifications if university server infrastructure experiences downtime</span>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-red-600 rounded cursor-pointer accent-red-600" />
                  </label>
                </div>
              </Card>

              {/* Session & Sign Out */}
              <Card variant="default" className="bg-white border-slate-200/80 rounded-2xl p-6 shadow-xs flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Sign Out of Session</h4>
                  <p className="text-[11px] text-slate-500">Log out of your institutional Google session on this workstation</p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </Card>
            </div>
          )}

          {/* D. Shared Dashboard / Activity View */}
          {(activeNav === 'dashboard' || activeNav === 'activity') && (
            <div className="space-y-6">
              {/* Row 1: 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card variant="default" className="p-5 bg-white border-slate-200/80 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between pb-3">
                    <span className="text-xs font-semibold text-slate-500">Total Tracked Issues</span>
                    <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                      <Eye className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      {tickets.length}
                    </span>
                    <p className="text-[11px] text-slate-400">All submissions</p>
                  </div>
                </Card>

                <Card variant="default" className="p-5 bg-white border-slate-200/80 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between pb-3">
                    <span className="text-xs font-semibold text-slate-500">Student & Faculty</span>
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      {ticketCounts.student + ticketCounts.faculty}
                    </span>
                    <p className="text-[11px] text-slate-400">Academic users</p>
                  </div>
                </Card>

                <Card variant="default" className="p-5 bg-white border-slate-200/80 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between pb-3">
                    <span className="text-xs font-semibold text-slate-500">Secretary & Admin</span>
                    <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      {ticketCounts.secretary + ticketCounts.admin}
                    </span>
                    <p className="text-[11px] text-slate-400">Operations & Admin</p>
                  </div>
                </Card>

                <Card variant="default" className="p-5 bg-white border-slate-200/80 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between pb-3">
                    <span className="text-xs font-semibold text-slate-500">System Availability</span>
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">99.8%</span>
                    <p className="text-[11px] text-emerald-600 font-semibold">Active nominal state</p>
                  </div>
                </Card>
              </div>

              {/* Row 2: Performance Chart */}
              <div className="w-full">
                <Card variant="default" className="bg-white border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">
                      MSIS Platform Reliability & Issue Triage
                    </span>
                    <h2 className="text-3xl font-extrabold text-slate-900 mt-1">99.8%</h2>
                  </div>

                  <div className="relative pt-4 pb-2">
                    <svg className="w-full h-44 overflow-visible" viewBox="0 0 600 160">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="30" x2="600" y2="30" stroke="#f1f5f9" strokeDasharray="3 3" />
                      <line x1="0" y1="80" x2="600" y2="80" stroke="#f1f5f9" strokeDasharray="3 3" />
                      <line x1="0" y1="130" x2="600" y2="130" stroke="#f1f5f9" strokeDasharray="3 3" />
                      <path
                        d="M 0 120 Q 80 115 150 100 T 300 85 T 450 60 T 600 45 L 600 160 L 0 160 Z"
                        fill="url(#chartGradient)"
                      />
                      <path
                        d="M 0 120 Q 80 115 150 100 T 300 85 T 450 60 T 600 45"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2.5"
                      />
                      <circle cx="300" cy="85" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
                    </svg>

                    <div className="flex justify-between text-[11px] font-medium text-slate-400 pt-2 border-t border-slate-100">
                      <span>Week 1</span>
                      <span>Week 2</span>
                      <span>Week 3</span>
                      <span>Week 4</span>
                      <span>Current</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
