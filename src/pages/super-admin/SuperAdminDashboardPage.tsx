import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { useTickets } from '../../context/TicketsContext';
import { DashboardSkeleton, usePageSkeleton } from '../../components/ui/skeleton';
import {
  Eye,
  GraduationCap,
  ShieldAlert,
  CheckCircle,
  Folder,
  Users,
  Briefcase,
  ArrowRight
} from 'lucide-react';

export const SuperAdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { tickets, ticketCounts } = useTickets();
  const isLoading = usePageSkeleton(250);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-800 via-red-700 to-rose-700 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-red-50 border border-white/20">
            <span>MSIS Central Command • Super Admin</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Institutional Oversight & Ticket Audit
          </h1>
          <p className="text-xs sm:text-sm text-red-100 max-w-xl leading-relaxed">
            Global monitoring console across Student, Faculty, Secretary, and Administrative IT units.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/super-admin/tickets')}
          className="inline-flex items-center justify-center gap-2 px-4 h-10 rounded-2xl font-bold bg-white text-red-600 hover:bg-red-50 shadow-sm cursor-pointer text-xs shrink-0 transition-all border border-white"
        >
          <Folder className="h-4 w-4 text-red-600 shrink-0" />
          <span className="text-red-600 font-bold">Manage All Tickets ({tickets.length})</span>
        </button>
      </div>

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

      {/* Breakdown per role quick cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/super-admin/tickets')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-red-300 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Student Queue</span>
              <span className="text-[11px] text-slate-400">{ticketCounts.student} issues</span>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
        </div>

        <div
          onClick={() => navigate('/super-admin/tickets')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-red-300 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Faculty Queue</span>
              <span className="text-[11px] text-slate-400">{ticketCounts.faculty} issues</span>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
        </div>

        <div
          onClick={() => navigate('/super-admin/tickets')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-red-300 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Secretary Queue</span>
              <span className="text-[11px] text-slate-400">{ticketCounts.secretary} issues</span>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
        </div>

        <div
          onClick={() => navigate('/super-admin/tickets')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-red-300 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Admin Queue</span>
              <span className="text-[11px] text-slate-400">{ticketCounts.admin} issues</span>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboardPage;
