import React from 'react';
import { SubmitTicketForm } from '../../components/tickets/SubmitTicketForm';

export const StudentSubmitTicketPage: React.FC = () => {
  return <SubmitTicketForm currentRole="Student" roleSlug="student" />;
};

export default StudentSubmitTicketPage;
