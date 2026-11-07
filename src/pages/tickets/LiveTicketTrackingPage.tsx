import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { SupportTicket } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../context/TicketsContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { TicketAttachmentViewer } from '../../components/tickets/TicketAttachmentViewer';
import { formatRelativeTime } from '../../lib/utils';
import {
  ArrowLeft,
  Clock,
  Search,
  Send,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Paperclip,
  MessageSquare,
  Check,
  Save,
  Radio,
  Share2
} from 'lucide-react';

interface AuditLogEntry {
  id: number;
  action: string;
  previousStatus: string | null;
  newStatus: string;
  performedBy: string;
  performedByRole: string;
  notes: string;
  createdAt: string;
}

const STAGES = [
  {
    level: 1,
    name: 'In Progress' as const,
    label: 'Intake & Review',
    shortDesc: 'Issue received and registered into queue.',
    fullDesc: 'Technical intake confirmed. Issue cataloged with unique identifier and prioritized for triage evaluation.',
    icon: Clock,
  },
  {
    level: 2,
    name: 'Investigating' as const,
    label: 'Root Cause Diagnostics',
    shortDesc: 'Engineers diagnosing error logs and replication.',
    fullDesc: 'Technical specialists actively reviewing application stack traces, database queries, and reproduction conditions.',
    icon: Search,
  },
  {
    level: 3,
    name: 'Dispatched' as const,
    label: 'Specialized Queue',
    shortDesc: 'Routed to dedicated systems / engineering team.',
    fullDesc: 'Ticket dispatched to specialized department engineers for direct code fix or infrastructure remediation.',
    icon: Send,
  },
  {
    level: 4,
    name: 'Resolved' as const,
    label: 'Fix Deployed & Verified',
    shortDesc: 'Resolution deployed and verified by engineering.',
    fullDesc: 'Code fix implemented, staging tested, and deployed to production environment with verified resolution.',
    icon: CheckCircle2,
  },
  {
    level: 5,
    name: 'Closed' as const,
    label: 'Completed & Archived',
    shortDesc: 'Resolution confirmed; ticket officially archived.',
    fullDesc: 'Ticket verification concluded with reporter. Issue officially closed and permanently archived.',
    icon: ShieldCheck,
  },
];

export const LiveTicketTrackingPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tickets, updateTicketStatus } = useTickets();
  const { showToast } = useToast();

  const isSuperAdmin = user?.role === 'Super Admin';
  const roleSlug = isSuperAdmin ? 'super-admin' : (user?.role ? user.role.toLowerCase() : 'dashboard');

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Super Admin direct triage state
  const [adminStatus, setAdminStatus] = useState<SupportTicket['status']>('In Progress');
  const [adminMessage, setAdminMessage] = useState<string>('');
  const [isSavingStatus, setIsSavingStatus] = useState<boolean>(false);

  // Normalize ticket ID
  const normalizedId = useMemo(() => {
    return (ticketId || '').replace(/^#/, '').trim();
  }, [ticketId]);

  // Fetch ticket details from backend or local cache
  const fetchTicketDetails = useCallback(async (isManualRefresh = false) => {
    if (!normalizedId) return;

    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setLoadError(null);

    try {
      const response = await fetch(`/api/v1/tickets/get.php?id=${encodeURIComponent(normalizedId)}`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success' && data.ticket) {
        setTicket(data.ticket);
        setAdminStatus(data.ticket.status);
        setAdminMessage(data.ticket.supportMessage || '');
        if (Array.isArray(data.auditLogs)) {
          setAuditLogs(data.auditLogs);
        }
      } else {
        throw new Error(data.message || 'Ticket not found.');
      }
    } catch (err) {
      // Fallback to local tickets context if available
      const localMatch = tickets.find(
        (t) => t.id.toLowerCase() === normalizedId.toLowerCase() || t.id.toLowerCase() === `tk-${normalizedId.toLowerCase()}`
      );
      if (localMatch) {
        setTicket(localMatch);
        setAdminStatus(localMatch.status);
        setAdminMessage(localMatch.supportMessage || '');
      } else {
        setLoadError(err instanceof Error ? err.message : 'Could not retrieve ticket details.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [normalizedId, tickets]);

  useEffect(() => {
    fetchTicketDetails();
  }, [fetchTicketDetails]);

  // Sync with global tickets state in real-time
  useEffect(() => {
    if (!normalizedId || !tickets.length) return;
    const match = tickets.find(
      (t) => t.id.toLowerCase() === normalizedId.toLowerCase() || t.id.toLowerCase() === `tk-${normalizedId.toLowerCase()}`
    );
    if (match) {
      setTicket((prev) => {
        if (!prev) return match;
        if (
          prev.status !== match.status ||
          prev.supportMessage !== match.supportMessage ||
          prev.updatedAt !== match.updatedAt ||
          prev.attachmentsCount !== match.attachmentsCount
        ) {
          return { ...prev, ...match };
        }
        return prev;
      });
      setAdminStatus(match.status);
      setAdminMessage(match.supportMessage || '');
    }
  }, [tickets, normalizedId]);

  // Periodic focused silent live polling for the active ticket and audit log
  useEffect(() => {
    if (!normalizedId) return;
    let isMounted = true;

    const intervalId = setInterval(async () => {
      if (document.hidden) return;
      try {
        const response = await fetch(`/api/v1/tickets/get.php?id=${encodeURIComponent(normalizedId)}`, {
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) return;

        const data = await response.json();
        if (data.status === 'success' && data.ticket && isMounted) {
          setTicket((prev) => {
            if (!prev) return data.ticket;
            if (
              prev.status !== data.ticket.status ||
              prev.supportMessage !== data.ticket.supportMessage ||
              prev.updatedAt !== data.ticket.updatedAt
            ) {
              showToast({
                category: 'update',
                title: 'Live Ticket Update',
                message: `Status advanced to "${data.ticket.status}".`,
                duration: 4000,
              });
              return data.ticket;
            }
            return prev;
          });
          if (Array.isArray(data.auditLogs)) {
            setAuditLogs(data.auditLogs);
          }
        }
      } catch {
        // Silent
      }
    }, 3500);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [normalizedId, showToast]);

  // Handle Super Admin Save & Update
  const handleAdminSave = async () => {
    if (!ticket) return;
    setIsSavingStatus(true);
    try {
      updateTicketStatus(ticket.id, adminStatus, adminMessage.trim() || undefined);
      setTicket((prev) => (prev ? {
        ...prev,
        status: adminStatus,
        supportMessage: adminMessage.trim() || prev.supportMessage,
        updatedAt: new Date().toISOString(),
        updatedRelative: 'Just now',
      } : null));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast({
      category: 'info',
      title: 'Link Copied',
      message: 'Direct live ticket tracking link copied to clipboard.',
      duration: 3500,
    });
  };

  // Determine active level index
  const activeStageIndex = useMemo(() => {
    if (!ticket) return 0;
    const idx = STAGES.findIndex((s) => s.name === ticket.status);
    return idx >= 0 ? idx : 0;
  }, [ticket]);

  const progressPercent = useMemo(() => {
    return Math.round(((activeStageIndex + 1) / STAGES.length) * 100);
  }, [activeStageIndex]);

  const activeStage = STAGES[activeStageIndex];

  // Status Badge Helper
  const renderStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Resolved</span>
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span>In Progress</span>
          </span>
        );
      case 'Investigating':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
            <span>Investigating</span>
          </span>
        );
      case 'Dispatched':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <span>Dispatched</span>
          </span>
        );
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-slate-500" />
            <span>Closed</span>
          </span>
        );
    }
  };

  // Dynamic color for current stage indicator (strictly avoiding harsh red)
  const getCurrentStageTheme = (status: SupportTicket['status']) => {
    switch (status) {
      case 'Resolved':
        return {
          circle: 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md',
          badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
          title: 'text-emerald-950 font-bold',
          activeLine: 'bg-emerald-500',
          accentBorder: 'border-emerald-200',
          accentBg: 'bg-emerald-50/40',
          dot: 'bg-emerald-500',
        };
      case 'Closed':
        return {
          circle: 'bg-slate-700 text-white ring-4 ring-slate-200 shadow-md',
          badge: 'bg-slate-100 text-slate-700 border border-slate-300',
          title: 'text-slate-900 font-bold',
          activeLine: 'bg-slate-600',
          accentBorder: 'border-slate-200',
          accentBg: 'bg-slate-50/50',
          dot: 'bg-slate-500',
        };
      case 'Dispatched':
        return {
          circle: 'bg-purple-600 text-white ring-4 ring-purple-100 shadow-md',
          badge: 'bg-purple-50 text-purple-700 border border-purple-200/80',
          title: 'text-purple-950 font-bold',
          activeLine: 'bg-purple-500',
          accentBorder: 'border-purple-200',
          accentBg: 'bg-purple-50/40',
          dot: 'bg-purple-500',
        };
      case 'Investigating':
        return {
          circle: 'bg-sky-600 text-white ring-4 ring-sky-100 shadow-md',
          badge: 'bg-sky-50 text-sky-700 border border-sky-200/80',
          title: 'text-sky-950 font-bold',
          activeLine: 'bg-sky-500',
          accentBorder: 'border-sky-200',
          accentBg: 'bg-sky-50/40',
          dot: 'bg-sky-500',
        };
      case 'In Progress':
      default:
        return {
          circle: 'bg-amber-600 text-white ring-4 ring-amber-100 shadow-md',
          badge: 'bg-amber-50 text-amber-700 border border-amber-200/80',
          title: 'text-amber-950 font-bold',
          activeLine: 'bg-amber-500',
          accentBorder: 'border-amber-200',
          accentBg: 'bg-amber-50/40',
          dot: 'bg-amber-500',
        };
    }
  };

  const currentTheme = ticket ? getCurrentStageTheme(ticket.status) : getCurrentStageTheme('In Progress');

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-20 bg-white rounded-2xl border border-slate-200/80 p-4" />
        <div className="h-44 bg-white rounded-2xl border border-slate-200/80 p-6" />
        <div className="h-64 bg-white rounded-2xl border border-slate-200/80 p-6" />
      </div>
    );
  }

  if (loadError || !ticket) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Ticket Not Found</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {loadError || `Could not find a ticket matching reference #${normalizedId}. Please verify the ticket code or check your tickets list.`}
        </p>
        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/${roleSlug}/tickets`)}
            className="rounded-xl"
          >
            Back to Tickets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto animate-fadeIn pb-12">
      {/* Top Navigation & Status Banner */}
      <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate(`/${roleSlug}/tickets`)}
            className="h-9 w-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors shrink-0 cursor-pointer shadow-2xs"
            title="Back to Tickets"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                #{ticket.id}
              </span>
              {renderStatusBadge(ticket.status)}
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                <Radio className="h-3 w-3 text-emerald-600 animate-pulse" />
                <span>Live Tracker</span>
              </span>
            </div>
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight mt-1 truncate">
              {ticket.subject}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Copy shareable link"
          >
            <Share2 className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            type="button"
            onClick={() => fetchTicketDetails(true)}
            disabled={isRefreshing}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title="Refresh ticket status in real-time"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Stepper Card: Step-by-Step Level Tracker (Number indicators ON the line) */}
      <Card variant="default" className="bg-white border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-6">
        {/* Stepper Header with Progress Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Lifecycle Triage Roadmap
            </span>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
              Current Level: Level {activeStage.level} of 5 &bull; {activeStage.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
              {activeStage.fullDesc}
            </p>
          </div>

          <div className="sm:text-right shrink-0">
            <span className="text-xs font-extrabold text-slate-800 block">
              {progressPercent}% Complete
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              Updated {ticket.updatedRelative || formatRelativeTime(ticket.updatedAt || ticket.createdAt || ticket.submittedAt)}
            </span>
          </div>
        </div>

        {/* 1. Desktop & Tablet Stepper: Number Indicators directly on the connecting line */}
        <div className="hidden md:block pt-3 pb-2 px-2">
          <div className="relative flex items-start justify-between w-full">
            {/* The horizontal connecting background line through circle centers (top: 20px) */}
            <div className="absolute top-5 left-[10%] right-[10%] -translate-y-1/2 h-1 bg-slate-200 z-0 rounded-full" />

            {/* Active completed line up to current step */}
            <div
              className={`absolute top-5 left-[10%] -translate-y-1/2 h-1 ${currentTheme.activeLine} transition-all duration-500 z-0 rounded-full`}
              style={{
                width: `${(activeStageIndex / (STAGES.length - 1)) * 80}%`
              }}
            />

            {/* Stepper Nodes */}
            {STAGES.map((stage, idx) => {
              const isCompleted = idx < activeStageIndex;
              const isCurrent = idx === activeStageIndex;

              let nodeCircle = 'bg-white border-2 border-slate-300 text-slate-400';
              if (isCompleted) {
                nodeCircle = 'bg-emerald-500 text-white shadow-xs';
              } else if (isCurrent) {
                nodeCircle = currentTheme.circle;
              }

              return (
                <div key={stage.level} className="relative z-10 flex flex-col items-center flex-1 text-center">
                  {/* The number indicator resting directly ON the line */}
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${nodeCircle}`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4 stroke-[2.8]" />
                    ) : (
                      <span>{stage.level}</span>
                    )}
                  </div>

                  {/* Labels underneath the node */}
                  <div className="mt-3 space-y-0.5 max-w-[140px]">
                    <span
                      className={`text-xs font-bold block ${
                        isCurrent ? currentTheme.title : isCompleted ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {stage.name}
                    </span>
                    <span
                      className={`text-[11px] block leading-tight ${
                        isCurrent ? 'text-slate-600 font-medium' : isCompleted ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      {stage.label}
                    </span>

                    {/* Subtle, elegant stage badge */}
                    {isCurrent && (
                      <span
                        className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${currentTheme.badge}`}
                      >
                        Current Stage
                      </span>
                    )}
                    {isCompleted && (
                      <span className="inline-block mt-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        Completed
                      </span>
                    )}
                    {!isCurrent && !isCompleted && (
                      <span className="inline-block mt-1 text-[9px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                        Upcoming
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Mobile Responsive Vertical Timeline Stepper (Indicator numbers ON the vertical line) */}
        <div className="md:hidden relative pl-12 space-y-6">
          {/* Vertical background line centered at x = 20px (since circles are h-10 w-10 = 40px) */}
          <div className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-slate-200 rounded-full z-0" />

          {/* Active vertical line */}
          <div
            className={`absolute left-[19px] top-5 w-0.5 ${currentTheme.activeLine} transition-all duration-500 rounded-full z-0`}
            style={{
              height: `${(activeStageIndex / (STAGES.length - 1)) * 100}%`
            }}
          />

          {STAGES.map((stage, idx) => {
            const isCompleted = idx < activeStageIndex;
            const isCurrent = idx === activeStageIndex;

            let nodeCircle = 'bg-white border-2 border-slate-300 text-slate-400';
            if (isCompleted) {
              nodeCircle = 'bg-emerald-500 text-white shadow-xs';
            } else if (isCurrent) {
              nodeCircle = currentTheme.circle;
            }

            return (
              <div key={stage.level} className="relative flex items-start gap-3">
                {/* Number indicator directly ON the vertical line */}
                <div
                  className={`absolute left-0 top-0 h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-transform z-10 ${nodeCircle}`}
                >
                  {isCompleted ? <Check className="h-4 w-4 stroke-[2.8]" /> : stage.level}
                </div>

                <div className="pl-3 flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-bold ${
                        isCurrent ? currentTheme.title : isCompleted ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {stage.name}
                    </span>
                    {isCurrent && (
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${currentTheme.badge}`}
                      >
                        Current Stage
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        Completed
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                    {stage.label}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {stage.shortDesc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Super Admin Live Triage Action Bar (Visible only to Super Admin) */}
      {isSuperAdmin && (
        <Card variant="default" className="bg-white border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Super Admin Triage Controller</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              Broadcasts via SMTP email notification
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Advance Stage:
              </label>
              <select
                value={adminStatus}
                onChange={(e) => setAdminStatus(e.target.value as SupportTicket['status'])}
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-slate-500 cursor-pointer shadow-2xs"
              >
                <option value="In Progress">Level 1: In Progress</option>
                <option value="Investigating">Level 2: Investigating</option>
                <option value="Dispatched">Level 3: Dispatched</option>
                <option value="Resolved">Level 4: Resolved</option>
                <option value="Closed">Level 5: Closed</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Support Note for Reporter:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  placeholder="Optional explanatory update sent directly to reporter..."
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-slate-500 text-slate-800 shadow-2xs"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAdminSave}
                  disabled={isSavingStatus}
                  leftIcon={<Save className="h-3.5 w-3.5" />}
                  className="rounded-xl whitespace-nowrap bg-slate-900 hover:bg-slate-800 text-white shrink-0 shadow-2xs font-semibold"
                >
                  {isSavingStatus ? 'Saving...' : 'Save & Broadcast'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Single Full-Width Unified Card (Eliminating mismatched width cards) */}
      <Card variant="default" className="bg-white border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-6">
        {/* 1. Full-Width Balanced Metadata Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Requester Role
            </span>
            <span className="text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200 inline-block shadow-2xs">
              {ticket.category}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Department
            </span>
            <span className="text-xs font-semibold text-slate-800 truncate block">
              {ticket.department}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Submitted
            </span>
            <span className="text-xs font-medium text-slate-700 block">
              {ticket.submittedAt}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Last Progress
            </span>
            <span className="text-xs font-medium text-slate-700 block">
              {ticket.updatedRelative || formatRelativeTime(ticket.updatedAt || ticket.createdAt)}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Attached Files
            </span>
            <span className="text-xs font-semibold text-slate-800 block flex items-center gap-1">
              <Paperclip className="h-3 w-3 text-slate-400" />
              <span>{ticket.attachmentsCount} file{ticket.attachmentsCount !== 1 ? 's' : ''}</span>
            </span>
          </div>
        </div>

        {/* 2. Official Support Message Callout (Full width, calm blue/indigo theme) */}
        {ticket.supportMessage && (
          <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/70 border-l-4 border-sky-600 border border-sky-200 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-800 uppercase tracking-wider">
              <MessageSquare className="h-4 w-4 text-sky-600 shrink-0" />
              <span>Direct Message from Support Staff</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed italic pl-1">
              "{ticket.supportMessage}"
            </p>
            <div className="text-[11px] text-slate-500 font-semibold pt-1">
              &mdash; {ticket.supportRespondedByName || 'MSIS Technical Support Team'} &bull;{' '}
              {ticket.supportRespondedRelative || formatRelativeTime(ticket.supportRespondedAt || ticket.updatedAt)}
            </div>
          </div>
        )}

        {/* 3. Issue Description & Details (Full Width) */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Issue Description & Reproduction Details
          </span>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 font-normal">
            {ticket.description}
          </p>
        </div>

        {/* 4. Verified Attachments & Screenshots (Full Width) */}
        <div className="space-y-2">
          <TicketAttachmentViewer
            ticketId={ticket.id}
            attachmentsCount={ticket.attachmentsCount}
            initialAttachments={ticket.attachments}
          />
        </div>

        {/* 5. Audit Trail History (Full Width) */}
        {auditLogs.length > 0 && (
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Audit Trail History ({auditLogs.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                    <span className="text-slate-800 font-bold">{log.action}</span>
                    <span>{formatRelativeTime(log.createdAt)}</span>
                  </div>
                  <p className="text-slate-600">{log.notes || `Status: ${log.newStatus}`}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LiveTicketTrackingPage;
