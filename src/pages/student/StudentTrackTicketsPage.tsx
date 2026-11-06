import React from 'react';
import { TrackTicketsList } from '../../components/tickets/TrackTicketsList';

export const StudentTrackTicketsPage: React.FC = () => {
  return <TrackTicketsList currentRole="Student" roleSlug="student" />;
};

export default StudentTrackTicketsPage;
