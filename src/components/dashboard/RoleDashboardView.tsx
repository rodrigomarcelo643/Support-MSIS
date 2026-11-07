import React from 'react';
import type { UserRole } from '../../types';
import { useTickets } from '../../context/TicketsContext';
import { DashboardSkeleton, usePageSkeleton } from '../ui/skeleton';
import { ModernDashboardOverview } from './ModernDashboardOverview';

interface RoleDashboardViewProps {
  currentRole: UserRole;
  roleSlug: string;
}

export const RoleDashboardView: React.FC<RoleDashboardViewProps> = ({ currentRole, roleSlug }) => {
  const { getTicketsForRole } = useTickets();
  const isLoading = usePageSkeleton(250);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const roleTickets = getTicketsForRole(currentRole);

  return (
    <ModernDashboardOverview
      currentRole={currentRole}
      roleSlug={roleSlug}
      tickets={roleTickets}
    />
  );
};

export default RoleDashboardView;
