import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { SupportTicket, UserRole } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { FileUpload, type UploadedFile } from '../ui/file-upload';
import { TicketAttachmentViewer } from '../tickets/TicketAttachmentViewer';
import {
  Send,
  PlusCircle,
  Ticket,
  Paperclip,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Users,
  ShieldAlert,
  Search,
  Trash2,
  AlertTriangle,
  MessageSquare,
  Eye
} from 'lucide-react';

interface UserRoleViewProps {
  currentRole: Exclude<UserRole, 'Super Admin'>;
  tickets: SupportTicket[];
  onSubmitTicket: (newTicket: {
    subject: string;
    description: string;
    files: UploadedFile[];
    department?: string;
  }) => void;
  activeNav: string;
  onNavChange: (nav: string) => void;
  onStatusChange?: (id: string, status: SupportTicket['status']) => void;
  onDeleteTicket?: (id: string) => void;
}

export const UserRoleView: React.FC<UserRoleViewProps> = ({
  currentRole,
  tickets,
  onSubmitTicket,
  activeNav,
  onNavChange,
  onStatusChange: _onStatusChange,
  onDeleteTicket,
}) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketToDelete, setTicketToDelete] = useState<SupportTicket | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Filter only tickets that belong to the active user role
  const myRoleTickets = tickets.filter((t) => t.category === currentRole);

  const filteredMyTickets = myRoleTickets.filter((t) => {
    if (!ticketSearch.trim()) return true;
    return (
      t.subject.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      (t.department && t.department.toLowerCase().includes(ticketSearch.toLowerCase())) ||
      t.id.toLowerCase().includes(ticketSearch.toLowerCase())
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const generatedId = `TK-${Math.floor(10000 + Math.random() * 90000)}`;
      onSubmitTicket({
        subject,
        description,
        files,
      });

      setSubmittedId(generatedId);
      setIsSubmitting(false);
      setSubject('');
      setDescription('');
      setFiles([]);
    }, 700);
  };

  const getRoleIcon = () => {
    switch (currentRole) {
      case 'Student':
        return <GraduationCap className="h-4 w-4 text-red-600" />;
      case 'Faculty':
        return <Briefcase className="h-4 w-4 text-indigo-600" />;
      case 'Secretary':
        return <Users className="h-4 w-4 text-emerald-600" />;
      case 'Admin':
        return <ShieldAlert className="h-4 w-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar for Active Role */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
            {getRoleIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="whitespace-nowrap">{currentRole} Support Console</span>
              <span className="text-[10px] font-semibold bg-red-50 text-red-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                Verified Role
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate">
              Submit new bug reports or track all tickets filed under your account
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant={activeNav === 'submit-ticket' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onNavChange('submit-ticket')}
            leftIcon={<PlusCircle className="h-3.5 w-3.5" />}
            className="rounded-xl text-xs flex-1 sm:flex-initial whitespace-nowrap justify-center"
          >
            Submit Ticket
          </Button>

          <Button
            variant={activeNav === 'my-tickets' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onNavChange('my-tickets')}
            leftIcon={<Ticket className="h-3.5 w-3.5" />}
            className="rounded-xl text-xs flex-1 sm:flex-initial whitespace-nowrap justify-center"
          >
            My Tickets ({myRoleTickets.length})
          </Button>
        </div>
      </div>

      {/* VIEW A: SUBMIT BUG TICKET FORM */}
      {activeNav === 'submit-ticket' && (
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
          {submittedId ? (
            <Card variant="default" className="bg-white border-slate-200/90 shadow-sm p-5 sm:p-8 text-center space-y-3 sm:space-y-4 rounded-2xl sm:rounded-3xl">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Support Ticket Logged</h3>
                <p className="text-xs text-slate-500">
                  Your ticket has been dispatched under {currentRole} submission:
                </p>
                <p className="text-xl sm:text-2xl font-mono font-bold text-red-600 pt-1">
                  #{submittedId}
                </p>
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                MSIS technicians have received your report and files. You can follow live progress in "Track My Tickets".
              </p>
              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-3 w-full max-w-xs sm:max-w-none mx-auto">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavChange('my-tickets')}
                  className="rounded-xl w-full sm:w-auto justify-center whitespace-nowrap"
                >
                  Track My Tickets
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSubmittedId(null)}
                  className="rounded-xl w-full sm:w-auto justify-center whitespace-nowrap"
                >
                  Submit Another
                </Button>
              </div>
            </Card>
          ) : (
            <Card variant="default" className="bg-white border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-100 p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base font-bold text-slate-900">
                  Submit Bug or Technical Request
                </CardTitle>
                <CardDescription className="text-[11px] sm:text-xs text-slate-500">
                  Filing as <span className="font-semibold text-slate-800">{currentRole}</span> • Subject, replication details & file uploads
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit} className="bg-white">
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5 bg-white">
                  {/* Subject */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Portal login session timeout error on Chrome"
                      className="h-10 sm:h-11 px-3.5 text-xs bg-white text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Description & Details */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Description & Details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the bug, steps to reproduce, or technical details..."
                      className="p-3 sm:p-3.5 text-xs bg-white text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all resize-none placeholder:text-slate-400"
                    />
                  </div>

                  {/* File Upload Component */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Attachments (Screenshots, PDF, Error Logs)
                    </label>
                    <FileUpload
                      files={files}
                      onFilesChange={setFiles}
                      maxFiles={5}
                      maxSizeMB={10}
                    />
                  </div>
                </CardContent>

                <CardFooter className="bg-slate-50/70 border-t border-slate-100 p-4 sm:px-6 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSubmitting}
                    leftIcon={<Send className="h-3.5 w-3.5" />}
                    className="h-10 sm:h-11 px-6 rounded-xl font-semibold w-full sm:w-auto justify-center whitespace-nowrap"
                  >
                    Submit Ticket
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}
        </div>
      )}

      {/* VIEW B: TRACK MY OWN TICKETS */}
      {activeNav === 'my-tickets' && (
        <div className="space-y-3 sm:space-y-4">
          {/* Search Header */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                My Reported Tickets ({myRoleTickets.length})
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                Track status and technician responses for tickets filed under your account
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                placeholder="Search my tickets..."
                className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Tickets List Card */}
          <Card variant="default" className="bg-white border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            {filteredMyTickets.length === 0 ? (
              <div className="p-8 sm:p-12 text-center space-y-3">
                <Ticket className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">No tickets found for this account.</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavChange('submit-ticket')}
                  leftIcon={<PlusCircle className="h-3.5 w-3.5" />}
                  className="rounded-xl text-xs whitespace-nowrap"
                >
                  Submit First Bug
                </Button>
              </div>
            ) : (
              <>
                {/* Mobile View: Cards on < sm */}
                <div className="block sm:hidden divide-y divide-slate-100">
                  {filteredMyTickets.map((ticket) => (
                    <div key={ticket.id} className="p-3.5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] text-red-600 font-bold whitespace-nowrap">
                          #{ticket.id}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Read-Only Status Badge (Only Super Admin can mutate status) */}
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border shadow-2xs ${
                              ticket.status === 'Resolved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                : ticket.status === 'In Progress'
                                ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                                : ticket.status === 'Investigating'
                                ? 'bg-sky-50 text-sky-700 border-sky-200/80'
                                : 'bg-purple-50 text-purple-700 border-purple-200/80'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                ticket.status === 'Resolved'
                                  ? 'bg-emerald-500'
                                  : ticket.status === 'In Progress'
                                  ? 'bg-amber-500 animate-pulse'
                                  : ticket.status === 'Investigating'
                                  ? 'bg-sky-500 animate-pulse'
                                  : 'bg-purple-500'
                              }`}
                            />
                            <span>{ticket.status}</span>
                          </span>

                          {/* Details Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedTicket(ticket)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="View full details and attachments"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Ticket Button */}
                          <button
                            type="button"
                            onClick={() => setTicketToDelete(ticket)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete ticket"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        {ticket.department && (
                          <span className="text-[10px] font-semibold text-slate-500 block truncate">
                            {ticket.department}
                          </span>
                        )}
                        <h4 className="text-xs font-bold text-slate-900 mt-0.5 break-words">
                          {ticket.subject}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 break-words">
                          {ticket.description}
                        </p>
                      </div>

                      {/* Optional Support Message from Super Admin */}
                      {ticket.supportMessage && (
                        <div className="p-2.5 rounded-lg bg-red-50/60 border border-red-200/60 text-[11px] text-slate-700 flex items-start gap-1.5">
                          <MessageSquare className="h-3 w-3 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-red-700 block text-[10px]">Support Response:</span>
                            <span className="line-clamp-2">{ticket.supportMessage}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 pt-1 text-[10px] text-slate-400">
                        <div>
                          {ticket.attachmentsCount > 0 ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-md whitespace-nowrap">
                              <Paperclip className="h-3 w-3 text-red-500" />
                              <span>{ticket.attachmentsCount} file{ticket.attachmentsCount > 1 ? 's' : ''}</span>
                            </span>
                          ) : (
                            <span>No files</span>
                          )}
                        </div>
                        <span className="whitespace-nowrap">{ticket.submittedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View: Table on >= sm */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-y border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Ticket ID</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Subject & Details</th>
                        <th className="py-3 px-4">Attachments</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Submitted</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredMyTickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-[11px] text-red-600 font-bold whitespace-nowrap">
                            #{ticket.id}
                          </td>
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
                              {ticket.supportMessage && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-red-700 font-medium mt-1 truncate">
                                  <MessageSquare className="h-2.5 w-2.5 shrink-0" />
                                  <span className="truncate">Support: {ticket.supportMessage}</span>
                                </span>
                              )}
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
                            {/* Read-Only Status Badge (Only Super Admin can change status) */}
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-2xs ${
                                ticket.status === 'Resolved'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                  : ticket.status === 'In Progress'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                                  : ticket.status === 'Investigating'
                                  ? 'bg-sky-50 text-sky-700 border-sky-200/80'
                                  : 'bg-purple-50 text-purple-700 border-purple-200/80'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  ticket.status === 'Resolved'
                                    ? 'bg-emerald-500'
                                    : ticket.status === 'In Progress'
                                    ? 'bg-amber-500 animate-pulse'
                                    : ticket.status === 'Investigating'
                                    ? 'bg-sky-500 animate-pulse'
                                    : 'bg-purple-500'
                                }`}
                              />
                              <span>{ticket.status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[11px] text-slate-400 whitespace-nowrap">
                            {ticket.submittedAt}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedTicket(ticket)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 hover:bg-red-50 hover:text-red-700 border border-slate-200 hover:border-red-200 transition-colors cursor-pointer"
                                title="View full details and attachments"
                              >
                                <Eye className="h-3 w-3" />
                                <span>Details</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setTicketToDelete(ticket)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer border border-transparent hover:border-red-200"
                                title="Delete ticket"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-600" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal (Mounted via createPortal with z-[999]) */}
      {ticketToDelete &&
        createPortal(
          <div
            className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setTicketToDelete(null);
            }}
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 animate-scaleIn">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Confirm Ticket Deletion</h3>
                  <p className="text-xs text-slate-500 font-mono">#{ticketToDelete.id}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to permanently delete this ticket for{' '}
                <strong className="text-slate-800">"{ticketToDelete.subject}"</strong>? This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTicketToDelete(null)}
                  className="rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (onDeleteTicket) {
                      onDeleteTicket(ticketToDelete.id);
                    }
                    setTicketToDelete(null);
                  }}
                  className="rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                >
                  Delete Ticket
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Ticket Details & Document Viewer Modal (Mounted via createPortal with z-[999]) */}
      {selectedTicket &&
        createPortal(
          <div
            className="fixed inset-0 z-[999] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedTicket(null);
            }}
          >
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] animate-fadeIn overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 shrink-0 bg-white">
                <span className="font-mono text-sm sm:text-base font-bold text-red-600">
                  #{selectedTicket.id}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
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

                {/* Status Badge */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-red-600 shrink-0" />
                    Current Status
                  </span>
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
                </div>

                {/* Support Response if present */}
                {selectedTicket.supportMessage && (
                  <div className="p-3 rounded-xl bg-white border border-red-200 shadow-2xs space-y-1">
                    <span className="text-[10px] text-red-700 font-bold uppercase tracking-wider block">
                      Direct Message from Support:
                    </span>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium break-words">
                      {selectedTicket.supportMessage}
                    </p>
                  </div>
                )}

                {/* Interactive Attached Files & Document Viewer */}
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

              {/* Modal Footer */}
              <div className="px-4 sm:px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const toDel = selectedTicket;
                    setSelectedTicket(null);
                    setTicketToDelete(toDel);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Ticket</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default UserRoleView;
