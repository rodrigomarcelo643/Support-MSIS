import React from 'react';
import { TrackTicketsList } from '../../components/tickets/TrackTicketsList';

export const FacultyTrackTicketsPage: React.FC = () => {
  return <TrackTicketsList currentRole="Faculty" roleSlug="faculty" />;
};

export default FacultyTrackTicketsPage;
