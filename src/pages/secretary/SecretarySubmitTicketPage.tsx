import React from 'react';
import { SubmitTicketForm } from '../../components/tickets/SubmitTicketForm';

export const SecretarySubmitTicketPage: React.FC = () => {
  return <SubmitTicketForm currentRole="Secretary" roleSlug="secretary" />;
};

export default SecretarySubmitTicketPage;
