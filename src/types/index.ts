export type UserRole = 'Super Admin' | 'Faculty' | 'Student' | 'Secretary' | 'Admin';

export interface TicketAttachment {
  id?: number | string;
  name: string;
  storedName?: string;
  url: string;
  path?: string;
  size?: number;
  isImage?: boolean;
  type?: string;
}

export interface SupportTicket {
  id: string;
  category: 'Student' | 'Faculty' | 'Secretary' | 'Admin';
  department: string;
  subject: string;
  description: string;
  status: 'In Progress' | 'Investigating' | 'Resolved' | 'Dispatched';
  attachmentsCount: number;
  attachments?: TicketAttachment[];
  submittedAt: string;
  reporterName?: string;
  reporterEmail?: string;
  supportMessage?: string;
  supportRespondedByName?: string;
  supportRespondedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
