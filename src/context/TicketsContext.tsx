import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SupportTicket, UserRole } from '../types';
import type { UploadedFile } from '../components/ui/file-upload';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
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
  isLiveSyncing: boolean;
  lastSyncedAt: Date;
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
const TICKETS_CHANNEL = 'msis_tickets_realtime_sync';
const SYNC_SIGNAL_KEY = 'msis_tickets_last_sync_signal';

// Legacy dummy ticket codes to strip from cache so only real dynamic database records appear
const LEGACY_DUMMY_IDS = new Set(['TK-83009', 'TK-83001', 'TK-83004', 'TK-83002']);

/**
 * High-performance diff checker to avoid redundant re-renders
 */
function hasTicketsChanged(prev: SupportTicket[], next: SupportTicket[]): boolean {
  if (prev.length !== next.length) return true;
  const prevMap = new Map(prev.map((t) => [t.id, t]));
  for (const n of next) {
    const p = prevMap.get(n.id);
    if (!p) return true;
    if (p.status !== n.status) return true;
    if (p.updatedAt !== n.updatedAt) return true;
    if (p.supportMessage !== n.supportMessage) return true;
    if (p.attachmentsCount !== n.attachmentsCount) return true;
  }
  return false;
}

const TicketsContext = createContext<TicketsContextType | undefined>(undefined);

export const TicketsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveSyncing, setIsLiveSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());

  // Timestamp of our own mutations so we don't display redundant background toast notifications
  const lastLocalMutationTime = React.useRef<number>(0);

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

  // Broadcast mutation to all other open tabs in the browser
  const broadcastSyncSignal = () => {
    lastLocalMutationTime.current = Date.now();
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel(TICKETS_CHANNEL);
        channel.postMessage({ type: 'MUTATION', timestamp: Date.now() });
        channel.close();
      }
    } catch {
      // Fallback to storage event
    }
    try {
      localStorage.setItem(SYNC_SIGNAL_KEY, Date.now().toString());
    } catch {
      // ignore
    }
  };

  // Silent background sync that compares incoming data and only updates state on actual changes
  const syncTicketsSilently = React.useCallback(async (notifyOnChanges = true) => {
    try {
      setIsLiveSyncing(true);
      const remoteTickets = await fetchTicketsFromBackend();
      if (Array.isArray(remoteTickets)) {
        setTickets((prev) => {
          if (!hasTicketsChanged(prev, remoteTickets)) {
            return prev;
          }

          // If changes occurred and not triggered by our own recent action, alert the user
          const isOurOwnAction = Date.now() - lastLocalMutationTime.current < 2500;
          if (notifyOnChanges && !isOurOurAction(isOurOwnAction) && prev.length > 0) {
            const prevIds = new Set(prev.map((t) => t.id));
            const newTickets = remoteTickets.filter((t) => !prevIds.has(t.id));

            if (newTickets.length > 0) {
              const newest = newTickets[0];
              showToast({
                category: 'submission',
                title: 'New Ticket Ingested',
                message: `Ticket #${newest.id} from ${newest.reporterName || newest.category} arrived.`,
                duration: 4000,
              });
            } else {
              const prevMap = new Map(prev.map((t) => [t.id, t]));
              for (const rt of remoteTickets) {
                const pt = prevMap.get(rt.id);
                if (pt && pt.status !== rt.status) {
                  showToast({
                    category: 'update',
                    title: `Ticket #${rt.id} Status Updated`,
                    message: `Status advanced from "${pt.status}" to "${rt.status}".`,
                    duration: 4000,
                  });
                  break;
                }
              }
            }
          }

          return remoteTickets;
        });
        setLastSyncedAt(new Date());
      }
    } catch {
      // Silent failure during polling to keep UI smooth
    } finally {
      setIsLiveSyncing(false);
    }
  }, [showToast]);

  function isOurOurAction(val: boolean): boolean {
    return val;
  }

  // Hydrate tickets dynamically from backend MySQL database on load
  useEffect(() => {
    let isMounted = true;
    async function loadTickets() {
      try {
        const remoteTickets = await fetchTicketsFromBackend();
        if (isMounted) {
          if (Array.isArray(remoteTickets)) {
            setTickets(remoteTickets);
            setLastSyncedAt(new Date());
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

  // Real-time live polling & cross-tab synchronization engine
  useEffect(() => {
    // 1. Cross-tab BroadcastChannel listener
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel(TICKETS_CHANNEL);
        channel.onmessage = () => {
          syncTicketsSilently(false);
        };
      }
    } catch {
      // ignore
    }

    // 2. Storage event fallback for cross-tab sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === SYNC_SIGNAL_KEY || e.key === STORAGE_KEY) {
        syncTicketsSilently(false);
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. Tab visibility and focus triggers: refresh immediately when user looks at the window
    const handleFocus = () => {
      syncTicketsSilently(true);
    };
    const handleVisibility = () => {
      if (!document.hidden) {
        syncTicketsSilently(true);
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    // 4. Smart background polling: every 4 seconds when active, 15 seconds when backgrounded
    let pollInterval: any = null;
    const setupPolling = () => {
      if (pollInterval) clearInterval(pollInterval);
      const intervalMs = document.hidden ? 15000 : 4000;
      pollInterval = setInterval(() => {
        syncTicketsSilently(true);
      }, intervalMs);
    };

    setupPolling();
    const handleVisibilityForInterval = () => {
      setupPolling();
    };
    document.addEventListener('visibilitychange', handleVisibilityForInterval);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibilityForInterval);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [syncTicketsSilently]);

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
      broadcastSyncSignal();

      // Global toast for ticket submission success
      showToast({
        category: 'submission',
        title: 'Ticket Submitted Successfully',
        message: `Ticket #${serverTicket.id} has been logged and queued for engineering review.`,
        duration: 4000,
      });

      return serverTicket;
    } catch (err) {
      console.warn('Failed to submit ticket to backend MySQL, stored optimistically:', err);
      setTickets((prev) => [optimisticTicket, ...prev]);
      broadcastSyncSignal();

      // Global toast for optimistic submission with note
      showToast({
        category: 'submission',
        title: 'Ticket Submitted (Offline/Optimistic)',
        message: `Ticket #${optimisticTicket.id} saved in your local session.`,
        duration: 4000,
      });

      return optimisticTicket;
    }
  };

  const updateTicketStatus = (
    id: string,
    status: SupportTicket['status'],
    supportMessage?: string
  ) => {
    const nowIso = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              updatedAt: nowIso,
              updatedRelative: 'Just now',
              ...(supportMessage !== undefined ? {
                supportMessage,
                supportRespondedAt: nowIso,
                supportRespondedRelative: 'Just now',
                supportRespondedByName: user?.name || 'Support Staff',
              } : {}),
            }
          : t
      )
    );
    broadcastSyncSignal();

    // Global toast for update
    showToast({
      category: 'update',
      title: 'Ticket Updated',
      message: `Ticket #${id} status changed to "${status}"${supportMessage ? ' with support note' : ''}.`,
      duration: 4000,
    });

    // Sync with backend API
    updateTicketStatusOnBackend(id, status, supportMessage, {
      id: user?.id,
      name: user?.name,
      email: user?.email,
    }).catch((err) => {
      console.warn('Backend update status failed:', err);
      showToast({
        category: 'error',
        title: 'Update Synchronization Warning',
        message: err instanceof Error ? err.message : 'Could not synchronize status with backend server.',
        duration: 4000,
      });
    });
  };

  const deleteTicket = (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
    broadcastSyncSignal();

    // Global toast for deletion
    showToast({
      category: 'delete',
      title: 'Ticket Deleted',
      message: `Ticket #${id} was permanently removed.`,
      duration: 4000,
    });

    // Sync with backend API
    deleteTicketOnBackend(id).catch((err) => {
      console.warn('Backend delete ticket failed:', err);
      showToast({
        category: 'error',
        title: 'Delete Server Error',
        message: err instanceof Error ? err.message : 'Failed to delete ticket from backend storage.',
        duration: 4000,
      });
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
        isLiveSyncing,
        lastSyncedAt,
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
