import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '../../types';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useTickets } from '../../context/TicketsContext';
import { DashboardSkeleton, usePageSkeleton } from '../ui/skeleton';
import {
  Eye,
  CheckCircle,
  Clock,
  PlusCircle,
  Ticket,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface RoleDashboardViewProps {
  currentRole: UserRole;
  roleSlug: string;
}

export const RoleDashboardView: React.FC<RoleDashboardViewProps> = ({ currentRole, roleSlug }) => {
  const navigate = useNavigate();
  const { getTicketsForRole } = useTickets();
  const isLoading = usePageSkeleton(250);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const roleTickets = getTicketsForRole(currentRole);
  const inProgressCount = roleTickets.filter((t) => t.status === 'In Progress').length;
  const investigatingCount = roleTickets.filter((t) => t.status === 'Investigating').length;
  const resolvedCount = roleTickets.filter((t) => t.status === 'Resolved').length;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Welcome Banner */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-red-700 via-red-600 to-rose-600 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1.5 sm:space-y-2 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/15 backdrop-blur-xs text-[11px] sm:text-xs font-semibold text-red-50 border border-white/20">
            <span>Welcome</span>
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-white">
            {currentRole} Support & Issue Hub
          </h1>
          <p className="text-xs sm:text-sm text-red-100 max-w-xl leading-relaxed">
            Direct channel for reporting technical malfunctions, LMS bugs, and system interruptions. Real-time engineering triage.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 shrink-0 w-full md:w-auto">
          <button
            type="button"
            onClick={() => navigate(`/${roleSlug}/submit`)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 h-9 sm:h-10 rounded-xl sm:rounded-2xl font-bold bg-white text-red-600 hover:bg-red-50 shadow-sm cursor-pointer text-xs whitespace-nowrap transition-all border border-white"
          >
            <PlusCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span className="text-red-600 font-bold whitespace-nowrap">Submit Ticket</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/${roleSlug}/tickets`)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 h-9 sm:h-10 rounded-xl sm:rounded-2xl font-bold bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs whitespace-nowrap cursor-pointer transition-all"
          >
            <Ticket className="h-4 w-4 text-white shrink-0" />
            <span className="whitespace-nowrap">Track ({roleTickets.length})</span>
          </button>
        </div>
      </div>

      {/* Row 1: Metrics (2x2 on mobile, 4 columns on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <Card variant="default" className="p-3.5 sm:p-5 bg-white border-slate-200/80 rounded-xl sm:rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-2 sm:pb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate block">My Filed Tickets</span>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 block">
              {roleTickets.length}
            </span>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Total submitted</p>
          </div>
        </Card>

        <Card variant="default" className="p-3.5 sm:p-5 bg-white border-slate-200/80 rounded-xl sm:rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-2 sm:pb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate block">In Progress</span>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 block">
              {inProgressCount}
            </span>
            <p className="text-[10px] sm:text-[11px] text-amber-600 font-semibold truncate">Under engineering review</p>
          </div>
        </Card>

        <Card variant="default" className="p-3.5 sm:p-5 bg-white border-slate-200/80 rounded-xl sm:rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-2 sm:pb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate block">Investigating</span>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 block">
              {investigatingCount}
            </span>
            <p className="text-[10px] sm:text-[11px] text-sky-600 font-semibold truncate">Triage in progress</p>
          </div>
        </Card>

        <Card variant="default" className="p-3.5 sm:p-5 bg-white border-slate-200/80 rounded-xl sm:rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-2 sm:pb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate block">Resolved</span>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 block">
              {resolvedCount}
            </span>
            <p className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold truncate">Completed solutions</p>
          </div>
        </Card>
      </div>

      {/* Row 2: Recent Tickets Section */}
      <div className="w-full space-y-4">
        <Card variant="default" className="bg-white border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 gap-2">
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">Recent {currentRole} Tickets</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">Latest tickets logged under your role</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/${roleSlug}/tickets`)}
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              className="rounded-xl text-xs shrink-0 whitespace-nowrap"
            >
              View All
            </Button>
          </div>

          <div className="space-y-2 sm:space-y-2.5">
            {roleTickets.slice(0, 5).map((t) => (
              <div
                key={t.id}
                onClick={() => navigate(`/${roleSlug}/tickets`)}
                className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-red-200 hover:bg-red-50/30 transition-all cursor-pointer flex items-center justify-between gap-2.5 sm:gap-3 group"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
                    <span className="text-[10px] font-mono font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">
                      {t.id}
                    </span>
                    {t.department && (
                      <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold truncate">
                        {t.department}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-800 truncate group-hover:text-red-700 transition-colors">
                    {t.subject}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 whitespace-nowrap inline-block">
                    {t.status}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1 whitespace-nowrap">
                    {t.submittedAt}
                  </span>
                </div>
              </div>
            ))}

            {roleTickets.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                No tickets logged yet. Click "Submit Ticket" to report an issue.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
