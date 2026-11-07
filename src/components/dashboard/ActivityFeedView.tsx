import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { UserRole } from '../../types';
import { Card } from '../ui/card';
import { useTickets } from '../../context/TicketsContext';
import { ActivitySkeleton, usePageSkeleton } from '../ui/skeleton';
import { formatRelativeTime, formatBadgeCount } from '../../lib/utils';
import {
  Bell,
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle2,
  Send,
  MessageSquare,
  AlertCircle,
  Loader2,
  ChevronDown
} from 'lucide-react';

interface ActivityFeedViewProps {
  currentRole: UserRole;
}

interface ActivityEvent {
  id: string;
  ticketId: string;
  type: 'submission' | 'status_change' | 'support_response';
  title: string;
  subject: string;
  details: string;
  timestamp: string;
  rawTime: number;
  badge: string;
  badgeClass: string;
  icon: React.ReactNode;
  dotBorderClass: string;
}

function parseToTimestamp(dateStr?: string | null): number {
  if (!dateStr) return 0;
  // If ISO or standard datetime format
  const normalized = dateStr.includes(' ') && !dateStr.includes('T') ? dateStr.replace(' ', 'T') : dateStr;
  const t = new Date(normalized).getTime();
  return isNaN(t) ? 0 : t;
}

export const ActivityFeedView: React.FC<ActivityFeedViewProps> = ({ currentRole }) => {
  const { tickets, getTicketsForRole } = useTickets();
  const isLoading = usePageSkeleton(250);

  const isSuperAdmin = currentRole === 'Super Admin';
  const roleTickets = useMemo(() => {
    return isSuperAdmin ? tickets : getTicketsForRole(currentRole);
  }, [isSuperAdmin, tickets, getTicketsForRole, currentRole]);

  // Expand tickets into individual chronological audit events
  const activityEvents: ActivityEvent[] = useMemo(() => {
    const list: ActivityEvent[] = [];

    roleTickets.forEach((t) => {
      const subRawTime = parseToTimestamp(t.createdAt) || parseToTimestamp(t.submittedAt) || 1;
      const subTimestamp = t.submittedAt || formatRelativeTime(t.createdAt);

      // 1. Ticket Submission Event (Base event for every ticket)
      list.push({
        id: `${t.id}-filed`,
        ticketId: t.id,
        type: 'submission',
        title: 'Ticket Submitted',
        subject: t.subject,
        details: `Category: ${t.category} • Department: ${t.department || 'General'}`,
        timestamp: subTimestamp,
        rawTime: subRawTime,
        badge: 'Submitted',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: <FileText className="h-3.5 w-3.5 text-blue-600" />,
        dotBorderClass: 'border-blue-600',
      });

      // 2. Status Progression Event (if ticket transitioned beyond initial 'In Progress')
      if (t.status && t.status !== 'In Progress') {
        const isResolved = t.status === 'Resolved';
        const isClosed = t.status === 'Closed';
        const isDispatched = t.status === 'Dispatched';
        const isInvestigating = t.status === 'Investigating';

        const statusRawTime = parseToTimestamp(t.updatedAt) || subRawTime;
        const statusTimestamp = t.updatedRelative || formatRelativeTime(t.updatedAt || t.createdAt);

        list.push({
          id: `${t.id}-status`,
          ticketId: t.id,
          type: 'status_change',
          title: `Status Updated to ${t.status}`,
          subject: t.subject,
          details: isClosed
            ? 'Ticket has been permanently closed as the final stage.'
            : isResolved
            ? 'Issue marked as resolved and verified by technical staff.'
            : isDispatched
            ? 'Ticket dispatched to specialized department queue for immediate handling.'
            : isInvestigating
            ? 'Technical team actively investigating issue root cause.'
            : `Status triage changed to ${t.status}.`,
          timestamp: statusTimestamp,
          rawTime: statusRawTime,
          badge: t.status,
          badgeClass: isClosed
            ? 'bg-slate-100 text-slate-700 border-slate-300'
            : isResolved
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : isDispatched
            ? 'bg-purple-50 text-purple-700 border-purple-200'
            : isInvestigating
            ? 'bg-sky-50 text-sky-700 border-sky-200'
            : 'bg-amber-50 text-amber-700 border-amber-200',
          icon: isClosed ? (
            <ShieldCheck className="h-3.5 w-3.5 text-slate-600" />
          ) : isResolved ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          ) : isDispatched ? (
            <Send className="h-3.5 w-3.5 text-purple-600" />
          ) : isInvestigating ? (
            <Clock className="h-3.5 w-3.5 text-sky-600" />
          ) : (
            <Clock className="h-3.5 w-3.5 text-amber-600" />
          ),
          dotBorderClass: isClosed
            ? 'border-slate-500'
            : isResolved
            ? 'border-emerald-600'
            : isDispatched
            ? 'border-purple-600'
            : isInvestigating
            ? 'border-sky-500'
            : 'border-amber-500',
        });
      }

      // 3. Support Team Response Event (if support message has been appended)
      if (t.supportMessage) {
        const supportRawTime =
          parseToTimestamp(t.supportRespondedAt) ||
          parseToTimestamp(t.updatedAt) ||
          subRawTime;
        const supportTimestamp =
          t.supportRespondedRelative ||
          formatRelativeTime(t.supportRespondedAt || t.updatedAt);

        list.push({
          id: `${t.id}-support-msg`,
          ticketId: t.id,
          type: 'support_response',
          title: 'Support Team Note Added',
          subject: t.subject,
          details: `"${t.supportMessage}"`,
          timestamp: supportTimestamp,
          rawTime: supportRawTime,
          badge: 'Support Response',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: <MessageSquare className="h-3.5 w-3.5 text-purple-600" />,
          dotBorderClass: 'border-purple-600',
        });
      }
    });

    // Sort chronologically descending so latest activity period appears first
    return list.sort((a, b) => b.rawTime - a.rawTime);
  }, [roleTickets]);

  // Display limit for incremental lazy loading (10 items per page/view)
  const [displayLimit, setDisplayLimit] = useState<number>(10);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  // Reset display limit when user role or tickets context switches
  useEffect(() => {
    setDisplayLimit(10);
  }, [currentRole]);

  const hasMore = displayLimit < activityEvents.length;
  const remainingCount = Math.max(0, activityEvents.length - displayLimit);

  const handleLoadMore = () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayLimit((prev) => Math.min(prev + 10, activityEvents.length));
      setIsLoadingMore(false);
    }, 200);
  };

  const handleShowAll = () => {
    setDisplayLimit(activityEvents.length);
  };

  // Automatic IntersectionObserver trigger for smooth infinite lazy scroll
  useEffect(() => {
    if (!hasMore) return;
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          handleLoadMore();
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, activityEvents.length]);

  const visibleEvents = useMemo(() => {
    return activityEvents.slice(0, displayLimit);
  }, [activityEvents, displayLimit]);

  if (isLoading) {
    return <ActivitySkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Header Banner */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 shrink-0" />
            <span className="whitespace-nowrap">Activity & System Log</span>
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 whitespace-nowrap">
              {formatBadgeCount(activityEvents.length)} Events
            </span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
            {isSuperAdmin
              ? 'Institutional activity audit stream across all user roles and ticket dispatches.'
              : `Activity timeline and triage progress tailored specifically for ${currentRole}.`}
          </p>
        </div>
      </div>

      {/* Audit Log Timeline Card */}
      <Card variant="default" className="bg-white border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs">
        <div className="relative pl-4 sm:pl-6 space-y-4 sm:space-y-6 before:absolute before:left-1.5 sm:before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-100">
          {activityEvents.length === 0 && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1.5">
              <AlertCircle className="h-6 w-6 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No activity logs recorded yet</p>
              <p className="text-[11px] text-slate-500">
                Ticket submissions, status updates, and support messages for {currentRole} will stream here dynamically.
              </p>
            </div>
          )}

          {/* Dynamic Events List (Bounded to 10 initially with Lazy Loading) */}
          {visibleEvents.map((event) => (
            <div key={event.id} className="relative flex items-start gap-3 sm:gap-4 group">
              <div
                className={`absolute -left-4 sm:-left-6 mt-1.5 h-3.5 w-3.5 rounded-full bg-white border-2 ${event.dotBorderClass} shrink-0 transition-transform group-hover:scale-110`}
              />
              <div className="flex-1 bg-slate-50/70 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 group-hover:border-red-200 group-hover:bg-slate-50 transition-colors min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                    <span className="font-mono text-[10px] sm:text-xs font-bold text-red-600 bg-red-50 px-1.5 sm:px-2 py-0.5 rounded shrink-0 whitespace-nowrap">
                      {event.ticketId}
                    </span>
                    <span className="text-xs font-bold text-slate-800 break-words flex items-center gap-1.5">
                      {event.icon}
                      {event.title}
                    </span>
                    <span
                      className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border ${event.badgeClass} whitespace-nowrap`}
                    >
                      {event.badge}
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium shrink-0 whitespace-nowrap">
                    {event.timestamp}
                  </span>
                </div>

                <div className="mt-1.5 sm:mt-2 space-y-0.5">
                  <p className="text-xs font-medium text-slate-700 break-words">
                    {event.subject}
                  </p>
                  <p className="text-xs text-slate-500 break-words">
                    {event.details}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Lazy Load Sentinel & Load More Trigger */}
          {hasMore && (
            <div className="relative flex flex-col items-center justify-center pt-2 pb-1 space-y-2">
              {/* Invisible sentinel for IntersectionObserver auto-trigger */}
              <div ref={observerTarget} className="h-2 w-full pointer-events-none" />

              <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] sm:text-xs text-slate-500 font-medium text-center sm:text-left">
                  Showing <strong className="text-slate-800 font-bold">{visibleEvents.length}</strong> of{' '}
                  <strong className="text-slate-800 font-bold">{formatBadgeCount(activityEvents.length)}</strong> activities
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3.5 w-3.5" />
                        <span>Load More (+{Math.min(10, remainingCount)})</span>
                      </>
                    )}
                  </button>

                  {remainingCount > 10 && (
                    <button
                      type="button"
                      onClick={handleShowAll}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      Show All ({remainingCount})
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {!hasMore && activityEvents.length > 10 && (
            <div className="text-center py-2">
              <span className="text-[11px] text-slate-400 font-medium inline-flex items-center gap-1">
                <span>✓ All {formatBadgeCount(activityEvents.length)} activities loaded</span>
              </span>
            </div>
          )}

          {/* System Verified Session Marker */}
          <div className="relative flex items-start gap-3 sm:gap-4">
            <div className="absolute -left-4 sm:-left-6 mt-1.5 h-3.5 w-3.5 rounded-full bg-white border-2 border-emerald-500 shrink-0" />
            <div className="flex-1 bg-slate-50/70 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  Institutional Identity Verified
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 shrink-0">Session Start</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 break-words leading-relaxed">
                Authenticated session securely verified against institutional system directory records.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
