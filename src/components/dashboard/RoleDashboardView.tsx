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
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-700 via-red-600 to-rose-600 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-red-50 border border-white/20">
            <span>Welcome</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            {currentRole} Support & Issue Hub
          </h1>
          <p className="text-xs sm:text-sm text-red-100 max-w-xl leading-relaxed">
            Direct channel for reporting technical malfunctions, LMS bugs, and system interruptions. Real-time engineering triage.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate(`/${roleSlug}/submit`)}
            className="inline-flex items-center justify-center gap-2 px-4 h-10 rounded-2xl font-bold bg-white text-red-600 hover:bg-red-50 shadow-sm cursor-pointer text-xs transition-all border border-white"
          >
            <PlusCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span className="text-red-600 font-bold">Submit Ticket</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/${roleSlug}/tickets`)}
            className="inline-flex items-center justify-center gap-2 px-4 h-10 rounded-2xl font-bold bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs cursor-pointer transition-all"
          >
            <Ticket className="h-4 w-4 text-white shrink-0" />
            <span>Track ({roleTickets.length})</span>
          </button>
        </div>
      </div>

      {/* Row 1: Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="default" className="p-5 bg-white border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold text-slate-500">My Filed Tickets</span>
            <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {roleTickets.length}
            </span>
            <p className="text-[11px] text-slate-400">Total submitted</p>
          </div>
        </Card>

        <Card variant="default" className="p-5 bg-white border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold text-slate-500">Active / In Progress</span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {inProgressCount}
            </span>
            <p className="text-[11px] text-amber-600 font-semibold">Under engineering review</p>
          </div>
        </Card>

        <Card variant="default" className="p-5 bg-white border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold text-slate-500">Investigating</span>
            <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {investigatingCount}
            </span>
            <p className="text-[11px] text-sky-600 font-semibold">Triage in progress</p>
          </div>
        </Card>

        <Card variant="default" className="p-5 bg-white border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold text-slate-500">Resolved Successfully</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {resolvedCount}
            </span>
            <p className="text-[11px] text-emerald-600 font-semibold">Completed solutions</p>
          </div>
        </Card>
      </div>

      {/* Row 2: Recent Tickets Section */}
      <div className="w-full space-y-4">
        <Card variant="default" className="bg-white border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent {currentRole} Tickets</h3>
              <p className="text-xs text-slate-500">Latest tickets logged under your role</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/${roleSlug}/tickets`)}
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              className="rounded-xl text-xs"
            >
              View All
            </Button>
          </div>

          <div className="space-y-2.5">
            {roleTickets.slice(0, 5).map((t) => (
              <div
                key={t.id}
                onClick={() => navigate(`/${roleSlug}/tickets`)}
                className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-red-200 hover:bg-red-50/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                      {t.id}
                    </span>
                    {t.department && (
                      <span className="text-[11px] text-slate-500 font-semibold truncate">
                        {t.department}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-800 truncate group-hover:text-red-700 transition-colors">
                    {t.subject}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                    {t.status}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
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
