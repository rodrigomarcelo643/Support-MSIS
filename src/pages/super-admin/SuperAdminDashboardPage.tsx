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
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Top Banner */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-red-800 via-red-700 to-rose-700 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1.5 sm:space-y-2 min-w-0">
          <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/15 backdrop-blur-xs text-[11px] sm:text-xs font-semibold text-red-50 border border-white/20">
            <span>MSIS Central Command • Super Admin</span>
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-white">
            Institutional Oversight & Ticket Audit
          </h1>
          <p className="text-xs sm:text-sm text-red-100 max-w-xl leading-relaxed">
            Global monitoring console across Student, Faculty, Secretary, and Administrative IT units.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/super-admin/tickets')}
          className="inline-flex items-center justify-center gap-2 px-4 h-9 sm:h-10 rounded-xl sm:rounded-2xl font-bold bg-white text-red-600 hover:bg-red-50 shadow-sm cursor-pointer text-xs shrink-0 transition-all border border-white w-full sm:w-auto whitespace-nowrap"
        >
          <Folder className="h-4 w-4 text-red-600 shrink-0" />
          <span className="text-red-600 font-bold whitespace-nowrap">Manage All Tickets ({tickets.length})</span>
        </button>
      </div>

      {/* Row 1: 4 Metric Cards (2x2 on mobile, 4 columns on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <Card variant="default" className="p-3.5 sm:p-5 bg-white border-slate-200/80 rounded-xl sm:rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-2 sm:pb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate block">Total Issues</span>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 block">
              {tickets.length}
            </span>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">All submissions</p>
          </div>
        </Card>

        <Card variant="default" className="p-3.5 sm:p-5 bg-white border-slate-200/80 rounded-xl sm:rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-2 sm:pb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate block">Student & Faculty</span>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 block">
              {ticketCounts.student + ticketCounts.faculty}
            </span>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Academic users</p>
          </div>
        </Card>

        <Card variant="default" className="p-3.5 sm:p-5 bg-white border-slate-200/80 rounded-xl sm:rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-2 sm:pb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate block">Secretary & Admin</span>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 block">
              {ticketCounts.secretary + ticketCounts.admin}
            </span>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Operations & Admin</p>
          </div>
        </Card>

        <Card variant="default" className="p-3.5 sm:p-5 bg-white border-slate-200/80 rounded-xl sm:rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-2 sm:pb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate block">Availability</span>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 block">99.8%</span>
            <p className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold truncate">Nominal state</p>
          </div>
        </Card>
      </div>

      {/* Breakdown per role quick cards (2x2 on mobile, 4 columns on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div
          onClick={() => navigate('/super-admin/tickets')}
          className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-red-300 transition-all cursor-pointer flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 block truncate">Student</span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 truncate block">{ticketCounts.student} issues</span>
            </div>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        </div>

        <div
          onClick={() => navigate('/super-admin/tickets')}
          className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-red-300 transition-all cursor-pointer flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Briefcase className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 block truncate">Faculty</span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 truncate block">{ticketCounts.faculty} issues</span>
            </div>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        </div>

        <div
          onClick={() => navigate('/super-admin/tickets')}
          className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-red-300 transition-all cursor-pointer flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 block truncate">Secretary</span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 truncate block">{ticketCounts.secretary} issues</span>
            </div>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        </div>

        <div
          onClick={() => navigate('/super-admin/tickets')}
          className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-red-300 transition-all cursor-pointer flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 block truncate">Admin</span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 truncate block">{ticketCounts.admin} issues</span>
            </div>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboardPage;
