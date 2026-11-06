import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import { DashboardSkeleton, Skeleton } from '../../src/components/ui/skeleton';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f6fa] flex flex-col text-slate-800 antialiased font-sans">
        {/* Top Header Skeleton */}
        <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-20 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
        </header>

        {/* Page Body Skeleton */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
