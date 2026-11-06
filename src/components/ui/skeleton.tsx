import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { useTickets } from '../../context/TicketsContext';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-slate-200/80 relative overflow-hidden',
        'after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.6s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent',
        className
      )}
      {...props}
    />
  );
};

/**
 * Hook to manage page skeleton loading state on mount or data fetch
 */
export function usePageSkeleton(customDelay = 280) {
  let contextLoading = false;
  try {
    const tickets = useTickets();
    contextLoading = tickets.isLoading;
  } catch {
    // tickets context not present
  }
  const [isMounting, setIsMounting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounting(false);
    }, customDelay);
    return () => clearTimeout(timer);
  }, [customDelay]);

  return contextLoading || isMounting;
}

/* =========================================================================
   PAGE SKELETON PRESETS
   ========================================================================= */

// 1. Dashboard Skeleton (Banner, 4 Metrics, Recent Tickets)
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn select-none">
      {/* Banner Skeleton */}
      <div className="p-6 rounded-3xl bg-slate-200/80 h-36 flex flex-col justify-between animate-pulse">
        <div className="space-y-2">
          <Skeleton className="h-5 w-28 rounded-full bg-slate-300" />
          <Skeleton className="h-8 w-72 rounded-xl bg-slate-300" />
          <Skeleton className="h-4 w-96 rounded-lg bg-slate-300" />
        </div>
      </div>

      {/* Row 1: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-16 rounded" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Recent Tickets Card Skeleton */}
      <div className="w-full space-y-4">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-3 w-48 rounded" />
            </div>
            <Skeleton className="h-8 w-20 rounded-xl" />
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                  <Skeleton className="h-4 w-3/4 rounded" />
                </div>
                <div className="space-y-1.5 flex flex-col items-end">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-3 w-14 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Track Tickets List Skeleton
export const TrackTicketsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn select-none">
      {/* Top Banner Skeleton */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-44 rounded" />
          <Skeleton className="h-3 w-64 rounded" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <Skeleton className="h-10 w-full sm:w-80 rounded-xl" />
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Ticket Cards Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row justify-between gap-3"
          >
            <div className="space-y-2.5 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-3 w-28 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
              <Skeleton className="h-5 w-4/5 rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
            </div>
            <div className="flex flex-row sm:flex-col justify-between sm:justify-start items-end gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-4 w-12 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. Submit Ticket Form Skeleton
export const SubmitTicketSkeleton: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn select-none">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-3 w-56 rounded" />
          </div>
        </div>
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>

      {/* Form Card Skeleton */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100 space-y-2">
          <Skeleton className="h-5 w-52 rounded" />
          <Skeleton className="h-3 w-72 rounded" />
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-32 rounded" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
        <div className="p-6 bg-slate-50/70 border-t border-slate-100 flex justify-between items-center">
          <Skeleton className="h-3 w-40 rounded" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

// 4. Activity Skeleton
export const ActivitySkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn select-none">
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-44 rounded" />
          <Skeleton className="h-3 w-64 rounded" />
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-48 rounded" />
              </div>
              <Skeleton className="h-3 w-16 rounded" />
            </div>
            <Skeleton className="h-3 w-72 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

// 5. Settings Skeleton
export const SettingsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn select-none">
      <div className="pb-3 border-b border-slate-200 space-y-1.5">
        <Skeleton className="h-7 w-56 rounded" />
        <Skeleton className="h-3 w-72 rounded" />
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
        <Skeleton className="h-4 w-36 rounded" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-3 w-32 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

// 6. Sidebar Expanded Skeleton
export const SidebarExpandedSkeleton: React.FC = () => {
  return (
    <div className="h-full flex flex-col justify-between p-3.5 bg-white select-none animate-fadeIn">
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-1.5 px-1 py-1">
          <div className="flex items-center space-x-2.5">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
          </div>
          <Skeleton className="h-7 w-7 rounded-xl shrink-0" />
        </div>

        {/* Divider line gap */}
        <div className="border-b border-slate-200/80 mx-1 my-1" />

        {/* Navigation Items */}
        <div className="space-y-2 pt-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-4 w-4 rounded-md" />
                <Skeleton className="h-3.5 w-24 rounded" />
              </div>
              <Skeleton className="h-4 w-5 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Profile */}
      <div className="pt-3 border-t border-slate-100">
        <div className="p-2.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-20 rounded" />
              <Skeleton className="h-2.5 w-28 rounded" />
            </div>
          </div>
          <Skeleton className="h-4 w-4 rounded-md" />
        </div>
      </div>
    </div>
  );
};

// 7. Sidebar Collapsed Skeleton
export const SidebarCollapsedSkeleton: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col justify-between py-4 px-2 bg-white select-none items-center animate-fadeIn">
      <div className="flex flex-col items-center space-y-4 w-full">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="w-full flex flex-col items-center space-y-2 pt-2 border-t border-slate-100">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-xl" />
          ))}
        </div>
      </div>
      <Skeleton className="h-9 w-9 rounded-full" />
    </div>
  );
};

export default Skeleton;
