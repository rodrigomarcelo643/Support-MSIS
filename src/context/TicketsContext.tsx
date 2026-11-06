import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SupportTicket, UserRole } from '../types';
import type { UploadedFile } from '../components/ui/file-upload';
import { useAuth } from './AuthContext';

interface SubmitTicketInput {
  subject: string;
  description: string;
  files: UploadedFile[];
  department?: string;
  category?: 'Student' | 'Faculty' | 'Secretary' | 'Admin';
}

interface TicketsContextType {
  tickets: SupportTicket[];
  isLoading: boolean;
  submitTicket: (input: SubmitTicketInput) => SupportTicket;
  updateTicketStatus: (id: string, status: SupportTicket['status']) => void;
  ticketCounts: {
    total: number;
    student: number;
    faculty: number;
    secretary: number;
    admin: number;
  };
  getTicketsForRole: (role: UserRole) => SupportTicket[];
  refreshTickets: () => void;
}

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'TK-83009',
    category: 'Faculty',
    department: 'MSIS Department',
    subject: 'Grade submission portal generates 500 error on CSV export',
    description: 'When exporting the final semester grades CSV for Section 2, the portal crashes with a 500 internal server error.',
    status: 'In Progress',
    attachmentsCount: 2,
    submittedAt: '15 mins ago',
    reporterName: 'Dr. Marcus Vance',
    reporterEmail: 'm.vance@msis.edu',
  },
  {
    id: 'TK-83001',
    category: 'Student',
    department: 'Information Systems',
    subject: 'Session timeout occurs prematurely during online quiz submission',
    description: 'Logged out after 5 minutes of inactivity despite active timer on the module quiz page.',
    status: 'Investigating',
    attachmentsCount: 1,
    submittedAt: '45 mins ago',
    reporterName: 'David Kim',
    reporterEmail: 'd.kim@student.msis.edu',
  },
  {
    id: 'TK-83004',
    category: 'Secretary',
    department: 'Academic Affairs',
    subject: 'Course syllabus document attachment fails to upload',
    description: 'PDF syllabus files over 2MB fail to upload with "Network request failed" error notification.',
    status: 'Resolved',
    attachmentsCount: 1,
    submittedAt: '2 hours ago',
    reporterName: 'Sarah Jenkins',
    reporterEmail: 's.jenkins@msis.edu',
  },
  {
    id: 'TK-83002',
    category: 'Admin',
    department: 'Computer Science',
    subject: 'Role permission cache not invalidating after faculty promotion',
    description: 'Promoted faculty members still see student-level permissions until manual server cache purge.',
    status: 'Dispatched',
    attachmentsCount: 3,
    submittedAt: '3 hours ago',
    reporterName: 'Robert Lang',
    reporterEmail: 'r.lang@admin.msis.edu',
  },
];

const STORAGE_KEY = 'msis_support_tickets_v1';

const TicketsContext = createContext<TicketsContextType | undefined>(undefined);

export const TicketsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return INITIAL_TICKETS;
  });

  useEffect(() => {
    // Initial hydration loading simulation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const refreshTickets = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 350);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    } catch {
      // ignore
    }
  }, [tickets]);

  const submitTicket = (input: SubmitTicketInput): SupportTicket => {
    const departmentLabels: Record<string, string> = {
      msis: 'MSIS Department',
      is: 'Information Systems',
      cs: 'Computer Science',
      it: 'Information Technology',
      academic: 'Academic Affairs',
      registrar: 'Registrar & Admissions',
      admin: 'Administration',
    };

    const resolvedCategory: 'Student' | 'Faculty' | 'Secretary' | 'Admin' =
      input.category ||
      (user?.role && ['Student', 'Faculty', 'Secretary', 'Admin'].includes(user.role)
        ? (user.role as 'Student' | 'Faculty' | 'Secretary' | 'Admin')
        : 'Admin');

    const newTicket: SupportTicket = {
      id: `TK-${Math.floor(10000 + Math.random() * 90000)}`,
      category: resolvedCategory,
      department: input.department ? (departmentLabels[input.department] || input.department) : `${resolvedCategory} Unit`,
      subject: input.subject,
      description: input.description,
      status: 'In Progress',
      attachmentsCount: input.files.length,
      submittedAt: 'Just now',
      reporterName: user?.name || `MSIS ${resolvedCategory}`,
      reporterEmail: user?.email || `${resolvedCategory.toLowerCase()}@msis.edu`,
    };

    setTickets((prev) => [newTicket, ...prev]);
    return newTicket;
  };

  const updateTicketStatus = (id: string, status: SupportTicket['status']) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  };

  const ticketCounts = {
    total: tickets.length,
    student: tickets.filter((t) => t.category === 'Student').length,
    faculty: tickets.filter((t) => t.category === 'Faculty').length,
    secretary: tickets.filter((t) => t.category === 'Secretary').length,
    admin: tickets.filter((t) => t.category === 'Admin').length,
  };

  const getTicketsForRole = (role: UserRole) => {
    if (role === 'Super Admin') return tickets;
    return tickets.filter((t) => t.category === role);
  };

  return (
    <TicketsContext.Provider
      value={{
        tickets,
        isLoading,
        submitTicket,
        updateTicketStatus,
        ticketCounts,
        getTicketsForRole,
        refreshTickets,
      }}
    >
      {children}
    </TicketsContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketsContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketsProvider');
  }
  return context;
};
