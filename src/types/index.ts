export type UserRole = 'Super Admin' | 'Faculty' | 'Student' | 'Secretary' | 'Admin';

export interface SupportTicket {
  id: string;
  category: 'Student' | 'Faculty' | 'Secretary' | 'Admin';
  department: string;
  subject: string;
  description: string;
  status: 'In Progress' | 'Investigating' | 'Resolved' | 'Dispatched';
  attachmentsCount: number;
  submittedAt: string;
  reporterName?: string;
  reporterEmail?: string;
  supportMessage?: string;
}
