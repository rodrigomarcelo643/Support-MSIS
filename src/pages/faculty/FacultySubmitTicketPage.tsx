import React from 'react';
import { SubmitTicketForm } from '../../components/tickets/SubmitTicketForm';

export const FacultySubmitTicketPage: React.FC = () => {
  return <SubmitTicketForm currentRole="Faculty" roleSlug="faculty" />;
};

export default FacultySubmitTicketPage;
