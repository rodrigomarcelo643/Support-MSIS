import React from 'react';
import type { UserRole } from '../../types';
import { Card } from '../ui/card';
import { useTickets } from '../../context/TicketsContext';
import { ActivitySkeleton, usePageSkeleton } from '../ui/skeleton';
import { Bell, ShieldCheck } from 'lucide-react';

interface ActivityFeedViewProps {
  currentRole: UserRole;
}

export const ActivityFeedView: React.FC<ActivityFeedViewProps> = ({ currentRole }) => {
  const { getTicketsForRole } = useTickets();
  const isLoading = usePageSkeleton(250);

  if (isLoading) {
    return <ActivitySkeleton />;
  }

  const tickets = getTicketsForRole(currentRole);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="h-5 w-5 text-red-600" />
            <span>Activity & System Log</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700">
              {tickets.length} Events
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit history of ticket dispatches, engineering triage, and status transitions for {currentRole}.
          </p>
        </div>
      </div>

      <Card variant="default" className="bg-white border-slate-200/90 rounded-3xl p-6 shadow-xs">
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-100">
          {tickets.map((t) => (
            <div key={t.id} className="relative flex items-start gap-4 group">
              <div className="absolute -left-6 mt-1.5 h-3.5 w-3.5 rounded-full bg-white border-2 border-red-600 shrink-0" />
              <div className="flex-1 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 group-hover:border-red-200 transition-colors">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                      {t.id}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {t.subject}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {t.submittedAt}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Category: <span className="font-semibold text-slate-700">{t.category}</span> • Status changed to <span className="font-bold text-slate-900">{t.status}</span>
                </p>
              </div>
            </div>
          ))}

          {/* System event */}
          <div className="relative flex items-start gap-4">
            <div className="absolute -left-6 mt-1.5 h-3.5 w-3.5 rounded-full bg-white border-2 border-emerald-500 shrink-0" />
            <div className="flex-1 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Institutional Identity Verified
                </span>
                <span className="text-[11px] text-slate-400">Session Start</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Authenticated session validated against MSIS Hostinger database records.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
