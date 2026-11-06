import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SupportTicket, UserRole } from '../types';
import type { UploadedFile } from '../components/ui/file-upload';
import { useAuth } from './AuthContext';
import {
  createTicketOnBackend,
  fetchTicketsFromBackend,
  updateTicketStatusOnBackend,
  deleteTicketOnBackend,
} from '../services/ticketsApi';

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
  submitTicket: (input: SubmitTicketInput) => Promise<SupportTicket>;
  updateTicketStatus: (id: string, status: SupportTicket['status'], supportMessage?: string) => void;
  deleteTicket: (id: string) => void;
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

const STORAGE_KEY = 'msis_support_tickets_v1';

// Legacy dummy ticket codes to strip from cache so only real dynamic database records appear
const LEGACY_DUMMY_IDS = new Set(['TK-83009', 'TK-83001', 'TK-83004', 'TK-83002']);

const TicketsContext = createContext<TicketsContextType | undefined>(undefined);

export const TicketsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Dynamic ticket state (Starts empty, populated dynamically from MySQL database)
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter((t: SupportTicket) => !LEGACY_DUMMY_IDS.has(t.id));
        }
      }
    } catch {
      // Fallback
    }
    return [];
  });

  // Hydrate tickets dynamically from backend MySQL database on load
  useEffect(() => {
    let isMounted = true;
    async function loadTickets() {
      try {
        const remoteTickets = await fetchTicketsFromBackend();
        if (isMounted) {
          if (Array.isArray(remoteTickets)) {
            setTickets(remoteTickets);
          }
        }
      } catch (err) {
        console.warn('Backend tickets API offline or using offline cache:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadTickets();
    return () => {
      isMounted = false;
    };
  }, []);

  const refreshTickets = () => {
    setIsLoading(true);
    fetchTicketsFromBackend()
      .then((remote) => {
        if (remote && remote.length > 0) {
          setTickets(remote);
        }
      })
      .catch((err) => {
        console.warn('Refresh tickets fallback:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    } catch {
      // ignore
    }
  }, [tickets]);

  const submitTicket = async (input: SubmitTicketInput): Promise<SupportTicket> => {
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

    const resolvedDepartment = input.department
      ? (departmentLabels[input.department] || input.department)
      : `${resolvedCategory} Unit`;

    const optimisticTicket: SupportTicket = {
      id: `TK-${Math.floor(10000 + Math.random() * 90000)}`,
      category: resolvedCategory,
      department: resolvedDepartment,
      subject: input.subject,
      description: input.description,
      status: 'In Progress',
      attachmentsCount: input.files.length,
      attachments: input.files.map((f, i) => ({
        id: i + 1,
        name: f.name,
        url: f.previewUrl || (f.file instanceof File ? URL.createObjectURL(f.file) : ''),
        size: f.size,
        isImage: f.type.startsWith('image/'),
      })),
      submittedAt: 'Just now',
      reporterName: user?.name || `MSIS ${resolvedCategory}`,
      reporterEmail: user?.email || `${resolvedCategory.toLowerCase()}@msis.edu`,
    };

    try {
      const serverTicket = await createTicketOnBackend({
        subject: input.subject,
        description: input.description,
        department: resolvedDepartment,
        category: resolvedCategory,
        files: input.files,
        reporterId: user?.id,
        reporterEmail: user?.email || optimisticTicket.reporterEmail,
        reporterName: user?.name || optimisticTicket.reporterName,
      });

      setTickets((prev) => [serverTicket, ...prev.filter((t) => t.id !== serverTicket.id)]);
      return serverTicket;
    } catch (err) {
      console.warn('Failed to submit ticket to backend MySQL, stored optimistically:', err);
      setTickets((prev) => [optimisticTicket, ...prev]);
      return optimisticTicket;
    }
  };

  const updateTicketStatus = (
    id: string,
    status: SupportTicket['status'],
    supportMessage?: string
  ) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              ...(supportMessage !== undefined ? { supportMessage } : {}),
            }
          : t
      )
    );

    // Sync with backend API
    updateTicketStatusOnBackend(id, status, supportMessage, {
      id: user?.id,
      name: user?.name,
      email: user?.email,
    }).catch((err) => {
      console.warn('Backend update status failed:', err);
    });
  };

  const deleteTicket = (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));

    // Sync with backend API
    deleteTicketOnBackend(id).catch((err) => {
      console.warn('Backend delete ticket failed:', err);
    });
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
        deleteTicket,
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
