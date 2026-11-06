import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import type { SupportTicket, UserRole } from '../../types';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useTickets } from '../../context/TicketsContext';
import { TrackTicketsSkeleton, usePageSkeleton } from '../ui/skeleton';
import { TicketAttachmentViewer } from './TicketAttachmentViewer';
import {
  Ticket,
  PlusCircle,
  Search,
  Paperclip,
  Filter,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface TrackTicketsListProps {
  currentRole: UserRole;
  roleSlug: string;
}

export const TrackTicketsList: React.FC<TrackTicketsListProps> = ({ currentRole, roleSlug }) => {
  const navigate = useNavigate();
  const { getTicketsForRole, updateTicketStatus, deleteTicket } = useTickets();
  const isLoading = usePageSkeleton(250);
  const [ticketSearch, setTicketSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | SupportTicket['status']>('All');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<SupportTicket | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [adminReplyText, setAdminReplyText] = useState<string>('');

  const isSuperAdmin = currentRole === 'Super Admin';

  if (isLoading) {
    return <TrackTicketsSkeleton />;
  }

  const roleTickets = getTicketsForRole(currentRole);

  const filteredTickets = roleTickets.filter((t) => {
    const matchesSearch =
      !ticketSearch.trim() ||
      t.subject.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      (t.department || '').toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.id.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(ticketSearch.toLowerCase());

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredTickets.length);
  const paginatedTickets = filteredTickets.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Top Banner */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
            <Ticket className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 shrink-0" />
            <span className="whitespace-nowrap">Track My Tickets</span>
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 whitespace-nowrap">
              {roleTickets.length} Filed
            </span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Real-time status updates and triage monitoring for all {currentRole} submissions.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate(`/${roleSlug}/submit`)}
          leftIcon={<PlusCircle className="h-3.5 w-3.5" />}
          className="rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shrink-0 w-full sm:w-auto justify-center whitespace-nowrap"
        >
          Submit Ticket
        </Button>
      </div>

      {/* Selection Above (Filter and Search Bar) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={ticketSearch}
            onChange={(e) => {
              setTicketSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by ticket ID, subject..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 shadow-2xs transition-all"
          />
        </div>

        {/* Status Selection Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 whitespace-nowrap">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Status:</span>
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="h-9 px-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500 focus:bg-white cursor-pointer transition-all shadow-2xs text-slate-700"
          >
            <option value="All">All Statuses ({roleTickets.length})</option>
            <option value="In Progress">In Progress</option>
            <option value="Investigating">Investigating</option>
            <option value="Resolved">Resolved</option>
            <option value="Dispatched">Dispatched</option>
          </select>
        </div>
      </div>

      {/* Details in Table Below */}
      <Card variant="default" className="bg-white border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {filteredTickets.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[760px] sm:min-w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Ticket ID</th>
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Attachments</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Submitted</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {paginatedTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-red-600 font-bold whitespace-nowrap">
                        #{t.id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap max-w-[200px] truncate">
                        {t.subject}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                        {t.description}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {t.attachmentsCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
                            <Paperclip className="h-3 w-3 text-red-500" />
                            <span>{t.attachmentsCount} file{t.attachmentsCount > 1 ? 's' : ''}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isSuperAdmin ? (
                          <select
                            value={t.status}
                            onChange={(e) =>
                              updateTicketStatus(t.id, e.target.value as SupportTicket['status'])
                            }
                            className={`text-xs font-bold py-1 px-2.5 rounded-lg border outline-none cursor-pointer transition-all shadow-2xs ${
                              t.status === 'Resolved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:border-emerald-500'
                                : t.status === 'In Progress'
                                ? 'bg-amber-50 text-amber-700 border-amber-200 focus:border-amber-500'
                                : t.status === 'Investigating'
                                ? 'bg-sky-50 text-sky-700 border-sky-200 focus:border-sky-500'
                                : 'bg-purple-50 text-purple-700 border-purple-200 focus:border-purple-500'
                            }`}
                            title="Super Admin: Change ticket status"
                          >
                            <option value="In Progress">In Progress</option>
                            <option value="Investigating">Investigating</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Dispatched">Dispatched</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-2xs whitespace-nowrap ${
                              t.status === 'Resolved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                : t.status === 'In Progress'
                                ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                                : t.status === 'Investigating'
                                ? 'bg-sky-50 text-sky-700 border-sky-200/80'
                                : 'bg-purple-50 text-purple-700 border-purple-200/80'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                t.status === 'Resolved'
                                  ? 'bg-emerald-500'
                                  : t.status === 'In Progress'
                                  ? 'bg-amber-500 animate-pulse'
                                  : t.status === 'Investigating'
                                  ? 'bg-sky-500 animate-pulse'
                                  : 'bg-purple-500'
                              }`}
                            />
                            <span>{t.status}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-400 whitespace-nowrap">
                        {t.submittedAt}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTicket(t);
                              setAdminReplyText(t.supportMessage || '');
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => setTicketToDelete(t)}
                            className="px-2 py-1 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            title="Delete Ticket"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Bar */}
            <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
                {/* Showing entries count */}
                <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Showing <span className="font-semibold text-slate-700">{filteredTickets.length > 0 ? startIndex + 1 : 0}</span>–
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
          </>
        ) : (
          <div className="p-10 text-center space-y-3">
            <Ticket className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">
              {ticketSearch || statusFilter !== 'All'
                ? 'No tickets match your search or status selection.'
                : 'No tickets filed yet under this role.'}
            </p>
            {ticketSearch || statusFilter !== 'All' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTicketSearch('');
                  setStatusFilter('All');
                }}
                className="rounded-xl text-xs"
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/${roleSlug}/submit`)}
                leftIcon={<PlusCircle className="h-3.5 w-3.5" />}
                className="rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
              >
                Submit Ticket
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Ticket Details & Response Modal (Mounted on document.body with z-[999]) */}
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
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
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

                {/* Status & Support Response Section */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-red-600 shrink-0" />
                      Status & Support Response
                    </span>

                    {/* ONLY Super Admin can change status; regular users see a badge */}
                    {isSuperAdmin ? (
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as SupportTicket['status'];
                          updateTicketStatus(selectedTicket.id, newStatus, adminReplyText);
                          setSelectedTicket({ ...selectedTicket, status: newStatus });
                        }}
                        className={`text-xs font-bold py-1 px-2.5 rounded-lg border outline-none cursor-pointer shadow-2xs ${
                          selectedTicket.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : selectedTicket.status === 'In Progress'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : selectedTicket.status === 'Investigating'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                        title="Super Admin: Update ticket status"
                      >
                        <option value="In Progress">In Progress</option>
                        <option value="Investigating">Investigating</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Dispatched">Dispatched</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-2xs ${
                          selectedTicket.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                            : selectedTicket.status === 'In Progress'
                            ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                            : selectedTicket.status === 'Investigating'
                            ? 'bg-sky-50 text-sky-700 border-sky-200/80'
                            : 'bg-purple-50 text-purple-700 border-purple-200/80'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            selectedTicket.status === 'Resolved'
                              ? 'bg-emerald-500'
                              : selectedTicket.status === 'In Progress'
                              ? 'bg-amber-500 animate-pulse'
                              : selectedTicket.status === 'Investigating'
                              ? 'bg-sky-500 animate-pulse'
                              : 'bg-purple-500'
                          }`}
                        />
                        <span>{selectedTicket.status}</span>
                      </span>
                    )}
                  </div>

                  {/* Optional Support Message (If Super Admin replied) */}
                  {selectedTicket.supportMessage ? (
                    <div className="p-3 rounded-xl bg-white border border-red-200/70 shadow-2xs space-y-1">
                      <span className="text-[10px] text-red-700 font-bold uppercase tracking-wider block">
                        Direct Message from Support:
                      </span>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium break-words">
                        {selectedTicket.supportMessage}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {selectedTicket.status === 'Resolved' &&
                        '✓ Fix deployed. MSIS engineering team has addressed the reported issue.'}
                      {selectedTicket.status === 'In Progress' &&
                        '⚡ Triage ongoing. Technicians have isolated the reported defect and are formulating a code resolution.'}
                      {selectedTicket.status === 'Investigating' &&
                        '🔍 Active investigation. Technicians are reviewing system logs, server queries, and error replication.'}
                      {selectedTicket.status === 'Dispatched' &&
                        '📋 Dispatched to core systems administrators for high-priority operational assessment.'}
                    </p>
                  )}

                  {/* Super Admin optional response field */}
                  {isSuperAdmin && (
                    <div className="pt-2 border-t border-slate-200/80">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                        Optional Support Message for User:
                      </label>
                      <textarea
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        placeholder="Add an optional message or status explanation for the user..."
                        rows={2}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 text-slate-800 placeholder:text-slate-400 transition-all"
                      />
                    </div>
                  )}
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
              </div>

              {/* Modal Footer (Fixed at bottom) */}
              <div className="px-4 sm:px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                {/* Delete Ticket Button with confirmation */}
                <button
                  type="button"
                  onClick={() => setTicketToDelete(selectedTicket)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Ticket</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer whitespace-nowrap shadow-2xs"
                  >
                    Close
                  </button>

                  {/* Super Admin can Save or Mark as Resolved */}
                  {isSuperAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          updateTicketStatus(selectedTicket.id, selectedTicket.status, adminReplyText);
                          setSelectedTicket({
                            ...selectedTicket,
                            supportMessage: adminReplyText,
                          });
                        }}
                        className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer whitespace-nowrap shadow-xs"
                      >
                        Save Message
                      </button>

                      {selectedTicket.status !== 'Resolved' && (
                        <button
                          type="button"
                          onClick={() => {
                            updateTicketStatus(selectedTicket.id, 'Resolved', adminReplyText);
                            setSelectedTicket({
                              ...selectedTicket,
                              status: 'Resolved',
                              supportMessage: adminReplyText,
                            });
                          }}
                          className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer whitespace-nowrap shadow-xs"
                        >
                          Mark as Resolved
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Delete Ticket Confirmation Dialog (Mounted via createPortal with z-[999]) */}
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
                  Are you sure you want to permanently delete this ticket from your tracking queue?
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
                    deleteTicket(ticketToDelete.id);
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
