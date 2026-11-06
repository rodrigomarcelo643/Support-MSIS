import React from 'react';
import { SubmitTicketForm } from '../../components/tickets/SubmitTicketForm';

export const AdminSubmitTicketPage: React.FC = () => {
  return <SubmitTicketForm currentRole="Admin" roleSlug="admin" />;
};

export default AdminSubmitTicketPage;
