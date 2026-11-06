import React from 'react';
import { TrackTicketsList } from '../../components/tickets/TrackTicketsList';

export const SecretaryTrackTicketsPage: React.FC = () => {
  return <TrackTicketsList currentRole="Secretary" roleSlug="secretary" />;
};

export default SecretaryTrackTicketsPage;
