import React from 'react';
import { Card } from '../../components/ui/card';
import { useAuth } from '../../context/AuthContext';
import { SettingsSkeleton, usePageSkeleton } from '../../components/ui/skeleton';
import { Settings as SettingsIcon, User as UserIcon, Bell, Check, LogOut } from 'lucide-react';

export const RoleSettingsPage: React.FC = () => {
  const { user, openLogoutModal } = useAuth();
  const isLoading = usePageSkeleton(250);
  const currentRole = user?.role || 'Admin';

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-red-600" />
            <span>Account & System Settings</span>
          </h1>
          <p className="text-xs text-slate-500">
            Manage your MSIS institutional profile, notifications, and preferences.
          </p>
        </div>
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
              {user?.name || `MSIS User (${currentRole})`}
            </h3>
            <p className="text-xs text-slate-500">
              {user?.email || `${currentRole.toLowerCase()}@msis.edu`}
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
              <span className="text-xs font-bold text-slate-800 block">System Maintenance Announcements</span>
              <span className="text-[11px] text-slate-500">Get notified about scheduled MSIS platform downtime and server updates</span>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 text-red-600 rounded cursor-pointer accent-red-600" />
          </label>
        </div>
      </Card>

      {/* Session Management Card */}
      <Card variant="default" className="bg-white border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Sign Out of Account</h3>
          <p className="text-xs text-slate-500">Safely terminate your authenticated MSIS session on this device.</p>
        </div>
        <button
          type="button"
          onClick={openLogoutModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100/80 border border-red-200 transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="h-3.5 w-3.5 text-red-600" />
          <span>Sign Out</span>
        </button>
      </Card>
    </div>
  );
};

export default RoleSettingsPage;
