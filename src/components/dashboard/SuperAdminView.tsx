import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import type { SupportTicket } from '../../types';
import { Card } from '../ui/card';
import { TicketAttachmentViewer } from '../tickets/TicketAttachmentViewer';
import { formatRelativeTime, formatBadgeCount } from '../../lib/utils';
import {
  ShieldAlert,
  GraduationCap,
  Briefcase,
  Users,
  Paperclip,
  Eye,
  Filter,
  Search,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Trash2,
  AlertTriangle,
  Clock,
  Radio,
  ExternalLink
} from 'lucide-react';

interface SuperAdminViewProps {
  tickets: SupportTicket[];
  onStatusChange: (ticketId: string, newStatus: SupportTicket['status'], message?: string) => void;
  activeFilterRole?: string;
  onFilterRoleChange?: (role: string) => void;
  onDeleteTicket?: (ticketId: string) => void;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  tickets,
  onStatusChange,
  activeFilterRole = 'all',
  onFilterRoleChange,
  onDeleteTicket,
}) => {
  const navigate = useNavigate();
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>(activeFilterRole);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [modalStatus, setModalStatus] = useState<SupportTicket['status']>('In Progress');
  const [ticketToDelete, setTicketToDelete] = useState<SupportTicket | null>(null);
  const [adminMessage, setAdminMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Synchronize inspect modal ticket details in real time if open
  React.useEffect(() => {
    if (!selectedTicket) return;
    const match = tickets.find((t) => t.id === selectedTicket.id);
    if (
      match &&
      (match.status !== selectedTicket.status ||
        match.supportMessage !== selectedTicket.supportMessage ||
        match.updatedAt !== selectedTicket.updatedAt)
    ) {
      setSelectedTicket(match);
      setModalStatus(match.status);
      setAdminMessage(match.supportMessage || '');
    }
  }, [tickets, selectedTicket]);

  const handleOpenInspect = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setModalStatus(ticket.status);
    setAdminMessage(ticket.supportMessage || '');
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRoleFilter(role);
    setCurrentPage(1);
    if (onFilterRoleChange) {
      onFilterRoleChange(role);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesRole =
      selectedRoleFilter === 'all' ||
      t.category.toLowerCase() === selectedRoleFilter.replace('-tickets', '').toLowerCase();

    const matchesSearch =
      searchQuery === '' ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesRole && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredTickets.length);
  const paginatedTickets = filteredTickets.slice(startIndex, startIndex + rowsPerPage);

  const getRoleBadge = (category: SupportTicket['category']) => {
    switch (category) {
      case 'Student':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700">
            <GraduationCap className="h-3 w-3" />
            <span>Student</span>
          </span>
        );
      case 'Faculty':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
            <Briefcase className="h-3 w-3" />
            <span>Faculty</span>
          </span>
        );
      case 'Secretary':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
            <Users className="h-3 w-3" />
            <span>Secretary</span>
          </span>
        );
      case 'Admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700">
            <ShieldAlert className="h-3 w-3" />
            <span>Admin</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Resolved</span>
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>In Progress</span>
          </span>
        );
      case 'Investigating':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
            <span>Investigating</span>
          </span>
        );
      case 'Dispatched':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            <span>Dispatched</span>
          </span>
        );
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            <span>Closed</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Notice Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            SA
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="whitespace-nowrap">Super Admin Central Console</span>
              <span className="text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200/60 px-2 py-0.5 rounded-full whitespace-nowrap">
                Core Tracking
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate">
              Audit and manage all technical issues across Student, Faculty, Secretary, and Admin submissions
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 shrink-0">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="whitespace-nowrap">Active Ingest Stream</span>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <Card variant="default" className="p-3 sm:p-4 bg-white border-slate-200/80 rounded-xl sm:rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-1.5 sm:pb-2">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate block">Total Issues</span>
            <div className="h-7 w-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <Eye className="h-3.5 w-3.5" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 block">{formatBadgeCount(tickets.length)}</span>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">Across 4 user categories</p>
        </Card>

        <Card variant="default" className="p-3 sm:p-4 bg-white border-slate-200/80 rounded-xl sm:rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-1.5 sm:pb-2">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate block">Student & Faculty</span>
            <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 block">
            {formatBadgeCount(tickets.filter((t) => t.category === 'Student' || t.category === 'Faculty').length)}
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">Academic submissions</p>
        </Card>

        <Card variant="default" className="p-3 sm:p-4 bg-white border-slate-200/80 rounded-xl sm:rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-1.5 sm:pb-2">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate block">Staff & Admin</span>
            <div className="h-7 w-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-3.5 w-3.5" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 block">
            {formatBadgeCount(tickets.filter((t) => t.category === 'Secretary' || t.category === 'Admin').length)}
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">Operational submissions</p>
        </Card>

        <Card variant="default" className="p-3 sm:p-4 bg-white border-slate-200/80 rounded-xl sm:rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-1.5 sm:pb-2">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate block">Resolution Rate</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle className="h-3.5 w-3.5" />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 block">95.8%</span>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5 truncate">Within SLA window</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        {/* Category Role Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1 shrink-0 whitespace-nowrap">
            <Filter className="h-3.5 w-3.5" />
            <span>Role:</span>
          </span>
          {[
            { id: 'all', label: 'All Roles' },
            { id: 'student', label: 'Student' },
            { id: 'faculty', label: 'Faculty' },
            { id: 'secretary', label: 'Secretary' },
            { id: 'admin', label: 'Admin' },
          ].map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => handleRoleSelect(role.id)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedRoleFilter === role.id ||
                selectedRoleFilter === `${role.id}-tickets`
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by ID, subject, dept..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Main Super Admin Table on sm and up / Mobile Card View on < sm */}
      <Card variant="default" className="bg-white border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Mobile View: Cards */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {paginatedTickets.map((ticket) => (
            <div key={ticket.id} className="p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => navigate(`/super-admin/tickets/${ticket.id}`)}
                    className="font-mono text-[11px] text-red-600 font-bold whitespace-nowrap hover:underline inline-flex items-center gap-1 cursor-pointer"
                    title="Open live whole page tracking"
                  >
                    <span>#{ticket.id}</span>
                    <Radio className="h-2.5 w-2.5 text-emerald-500 animate-pulse shrink-0" />
                  </button>
                  {getRoleBadge(ticket.category)}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => navigate(`/super-admin/tickets/${ticket.id}`)}
                    className="px-2 py-1 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-2xs flex items-center gap-1"
                    title="Open live whole page tracking"
                  >
                    <Radio className="h-3 w-3 text-red-600 animate-pulse shrink-0" />
                    <span>Live Track</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenInspect(ticket)}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Inspect
                  </button>
                  <button
                    type="button"
                    onClick={() => setTicketToDelete(ticket)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Ticket"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 block truncate">
                  {ticket.department}
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-0.5 break-words">
                  {ticket.subject}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 break-words">
                  {ticket.description}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <div>
                  {ticket.attachmentsCount > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-md whitespace-nowrap">
                      <Paperclip className="h-3 w-3 text-red-500" />
                      <span>{ticket.attachmentsCount} file{ticket.attachmentsCount > 1 ? 's' : ''}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">No files</span>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1">
                  {getStatusBadge(ticket.status)}
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5 text-slate-400" />
                    <span>Updated {ticket.updatedRelative || formatRelativeTime(ticket.updatedAt || ticket.createdAt || ticket.submittedAt)}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredTickets.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              No tickets found matching current filters.
            </div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Ticket Reference</th>
                <th className="py-3 px-4">Requester Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Subject & Description</th>
                <th className="py-3 px-4">Files</th>
                <th className="py-3 px-4">Status Triage</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginatedTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-red-600 font-bold whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => navigate(`/super-admin/tickets/${ticket.id}`)}
                      className="hover:underline inline-flex items-center gap-1 cursor-pointer group"
                      title="Open live whole page tracking"
                    >
                      <span className="group-hover:text-red-700">#{ticket.id}</span>
                      <Radio className="h-2.5 w-2.5 text-emerald-500 animate-pulse shrink-0" />
                    </button>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">{getRoleBadge(ticket.category)}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                    {ticket.department}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 truncate">
                        {ticket.subject}
                      </span>
                      <span className="text-[11px] text-slate-400 line-clamp-1">
                        {ticket.description}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {ticket.attachmentsCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
                        <Paperclip className="h-3 w-3 text-red-500" />
                        <span>{ticket.attachmentsCount} file{ticket.attachmentsCount > 1 ? 's' : ''}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">None</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col items-start gap-1">
                      {getStatusBadge(ticket.status)}
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5 text-slate-400" />
                        <span>Updated {ticket.updatedRelative || formatRelativeTime(ticket.updatedAt || ticket.createdAt || ticket.submittedAt)}</span>
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/super-admin/tickets/${ticket.id}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/80 rounded-lg transition-colors cursor-pointer shadow-2xs"
                        title="Open live whole page tracking with step-by-step indicators"
                      >
                        <Radio className="h-3 w-3 text-red-600 animate-pulse shrink-0" />
                        <span>Live Track</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenInspect(ticket)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                      <button
                        type="button"
                        onClick={() => setTicketToDelete(ticket)}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Ticket"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls Bar */}
        {filteredTickets.length > 0 && (
          <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
              {/* Showing count */}
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span>–
                <span className="font-semibold text-slate-700">{endIndex}</span> of{' '}
                <span className="font-semibold text-slate-700">{filteredTickets.length}</span> tickets
              </span>

              {/* Rows per page selector: 10, 20, 50 */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] sm:text-xs text-slate-500 whitespace-nowrap font-medium">Rows:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-7 px-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg outline-none focus:border-red-500 cursor-pointer shadow-2xs text-slate-700"
                  title="Rows per page"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Page navigation buttons */}
            <div className="flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-end">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={safeCurrentPage <= 1}
                className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-colors cursor-pointer shadow-2xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="text-[11px] sm:text-xs">Prev</span>
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - safeCurrentPage) <= 1
                    );
                  })
                  .map((page, idx, arr) => {
                    const prevPage = arr[idx - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;
                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && <span className="px-1 text-slate-400 text-xs">…</span>}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            safeCurrentPage === page
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={safeCurrentPage >= totalPages}
                className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-colors cursor-pointer shadow-2xs"
              >
                <span className="text-[11px] sm:text-xs">Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Ticket Inspection Modal for Super Admin (Mounted on document.body with z-[999]) */}
      {selectedTicket &&
        createPortal(
          <div
            className="fixed inset-0 z-[999] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedTicket(null);
            }}
          >
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] animate-fadeIn overflow-hidden">
              {/* Modal Header (Fixed at top) */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 shrink-0 bg-white">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm sm:text-base font-bold text-red-600">
                    #{selectedTicket.id}
                  </span>
                  {getRoleBadge(selectedTicket.category)}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const id = selectedTicket.id;
                      setSelectedTicket(null);
                      navigate(`/super-admin/tickets/${id}`);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer shadow-2xs"
                    title="Open Live Full-Page Tracking with Step-by-Step Indicators"
                  >
                    <Radio className="h-3 w-3 text-red-600 animate-pulse shrink-0" />
                    <span className="hidden sm:inline">Live Tracker</span>
                    <ExternalLink className="h-3 w-3 text-red-500 shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Department
                  </span>
                  <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                    {selectedTicket.department}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Subject
                  </span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm break-words mt-0.5 block">
                    {selectedTicket.subject}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Description & Reproduction Details
                  </span>
                  <p className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 leading-relaxed mt-1 break-words">
                    {selectedTicket.description}
                  </p>
                </div>

                {/* Attached Files & Interactive Viewer */}
                <div>
                  <TicketAttachmentViewer
                    ticketId={selectedTicket.id}
                    attachmentsCount={selectedTicket.attachmentsCount}
                    initialAttachments={selectedTicket.attachments}
                    onAttachmentsLoaded={(loadedAtts) => {
                      setSelectedTicket((prev) => (prev ? { ...prev, attachments: loadedAtts } : null));
                    }}
                  />
                </div>

                {/* Status Triage & Support Response Section */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-red-600 shrink-0" />
                        Status Triage
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                        <Clock className="h-2.5 w-2.5 text-slate-400" />
                        <span>Last progress: {selectedTicket.updatedRelative || formatRelativeTime(selectedTicket.updatedAt || selectedTicket.createdAt || selectedTicket.submittedAt)}</span>
                      </span>
                    </div>
                    <select
                      value={modalStatus}
                      onChange={(e) => {
                        setModalStatus(e.target.value as SupportTicket['status']);
                      }}
                      className={`text-xs font-bold py-1.5 px-3 rounded-xl border outline-none cursor-pointer shadow-2xs transition-colors ${
                        modalStatus === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : modalStatus === 'In Progress'
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : modalStatus === 'Investigating'
                          ? 'bg-sky-50 text-sky-700 border-sky-300'
                          : modalStatus === 'Dispatched'
                          ? 'bg-purple-50 text-purple-700 border-purple-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Investigating">Investigating</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                      Optional Message from Support (Visible to Reporter):
                    </label>
                    <textarea
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      placeholder="Type an optional explanation or message for the user..."
                      rows={2}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 text-slate-800 placeholder:text-slate-400 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer (Fixed at bottom) */}
              <div className="px-4 sm:px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                {onDeleteTicket ? (
                  <button
                    type="button"
                    onClick={() => setTicketToDelete(selectedTicket)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Ticket</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer whitespace-nowrap shadow-2xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={async () => {
                      setIsSaving(true);
                      await Promise.resolve(
                        onStatusChange(selectedTicket.id, modalStatus, adminMessage.trim())
                      );
                      setIsSaving(false);
                      setSelectedTicket(null);
                    }}
                    className="px-4 sm:px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer whitespace-nowrap shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>{isSaving ? 'Updating...' : 'Save & Update Ticket'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Delete Ticket Confirmation Dialog for Super Admin */}
      {ticketToDelete &&
        createPortal(
          <div
            className="fixed inset-0 z-[999] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setTicketToDelete(null);
            }}
          >
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Delete Ticket Confirmation
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    #{ticketToDelete.id}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2 text-xs text-slate-600 leading-relaxed">
                <p>
                  Permanently delete this ticket across the central support database?
                </p>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 font-medium text-slate-800 break-words">
                  "{ticketToDelete.subject}"
                </div>
                <p className="text-[11px] text-amber-700 font-medium">
                  ⚠️ This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTicketToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteTicket) {
                      onDeleteTicket(ticketToDelete.id);
                    }
                    if (selectedTicket?.id === ticketToDelete.id) {
                      setSelectedTicket(null);
                    }
                    setTicketToDelete(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Yes, Delete Ticket</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default SuperAdminView;
