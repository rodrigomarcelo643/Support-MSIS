import React from 'react';
import { useTickets } from '../../context/TicketsContext';
import { DashboardSkeleton, usePageSkeleton } from '../../components/ui/skeleton';
import { ModernDashboardOverview } from '../../components/dashboard/ModernDashboardOverview';

export const SuperAdminDashboardPage: React.FC = () => {
  const { tickets } = useTickets();
  const isLoading = usePageSkeleton(250);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <ModernDashboardOverview
      currentRole="Super Admin"
      roleSlug="super-admin"
      tickets={tickets}
    />
  );
};

export default SuperAdminDashboardPage;
