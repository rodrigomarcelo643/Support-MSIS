import React from 'react';
import { TrackTicketsList } from '../../components/tickets/TrackTicketsList';

export const AdminTrackTicketsPage: React.FC = () => {
  return <TrackTicketsList currentRole="Admin" roleSlug="admin" />;
};

export default AdminTrackTicketsPage;
