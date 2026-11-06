import React from 'react';
import { SuperAdminView } from '../../components/dashboard/SuperAdminView';
import { useTickets } from '../../context/TicketsContext';
import { TrackTicketsSkeleton, usePageSkeleton } from '../../components/ui/skeleton';

export const SuperAdminTicketsPage: React.FC = () => {
  const { tickets, updateTicketStatus } = useTickets();
  const isLoading = usePageSkeleton(250);

  if (isLoading) {
    return <TrackTicketsSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      <SuperAdminView
        tickets={tickets}
        onStatusChange={updateTicketStatus}
      />
    </div>
  );
};

export default SuperAdminTicketsPage;
