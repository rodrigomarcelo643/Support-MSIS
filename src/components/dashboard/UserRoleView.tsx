import React, { useState } from 'react';
import type { SupportTicket, UserRole } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { FileUpload, type UploadedFile } from '../ui/file-upload';
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
  Search
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
}

export const UserRoleView: React.FC<UserRoleViewProps> = ({
  currentRole,
  tickets,
  onSubmitTicket,
  activeNav,
  onNavChange,
}) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [ticketSearch, setTicketSearch] = useState('');

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
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
            {getRoleIcon()}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              {currentRole} Support Console
              <span className="text-[10px] font-semibold bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
                Verified Role
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Submit new bug reports or track all tickets filed under your {currentRole.toLowerCase()} account
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeNav === 'submit-ticket' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onNavChange('submit-ticket')}
            leftIcon={<PlusCircle className="h-3.5 w-3.5" />}
            className="rounded-xl text-xs"
          >
            Submit Ticket
          </Button>

          <Button
            variant={activeNav === 'my-tickets' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onNavChange('my-tickets')}
            leftIcon={<Ticket className="h-3.5 w-3.5" />}
            className="rounded-xl text-xs"
          >
            My Tickets ({myRoleTickets.length})
          </Button>
        </div>
      </div>

      {/* VIEW A: SUBMIT BUG TICKET FORM */}
      {activeNav === 'submit-ticket' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {submittedId ? (
            <Card variant="default" className="bg-white border-slate-200/90 shadow-sm p-8 text-center space-y-4 rounded-3xl">
              <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Support Ticket Logged</h3>
                <p className="text-xs text-slate-500">
                  Your ticket has been dispatched under {currentRole} submission:
                </p>
                <p className="text-2xl font-mono font-bold text-red-600 pt-1">
                  #{submittedId}
                </p>
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                MSIS technicians have received your report and files. You can follow live progress in "Track My Tickets".
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavChange('my-tickets')}
                  className="rounded-xl"
                >
                  Track My Tickets
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSubmittedId(null)}
                  className="rounded-xl"
                >
                  Submit Another
                </Button>
              </div>
            </Card>
          ) : (
            <Card variant="default" className="bg-white border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-100 p-6">
                <CardTitle className="text-base font-bold text-slate-900">
                  Submit Bug or Technical Request
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Filing as <span className="font-semibold text-slate-800">{currentRole}</span> • Subject, replication details & file uploads
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit} className="bg-white">
                <CardContent className="p-6 space-y-5 bg-white">
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
                      className="h-11 px-3.5 text-xs bg-white text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all placeholder:text-slate-400"
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
                      className="p-3.5 text-xs bg-white text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all resize-none placeholder:text-slate-400"
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

                <CardFooter className="bg-slate-50/70 border-t border-slate-100 py-4 px-6 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSubmitting}
                    leftIcon={<Send className="h-3.5 w-3.5" />}
                    className="h-11 px-6 rounded-xl font-semibold"
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
        <div className="space-y-4">
          {/* Search Header */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                My Reported Tickets ({myRoleTickets.length})
              </h3>
              <p className="text-xs text-slate-500">
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
              <div className="p-12 text-center space-y-3">
                <Ticket className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">No tickets found for this account.</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavChange('submit-ticket')}
                  leftIcon={<PlusCircle className="h-3.5 w-3.5" />}
                  className="rounded-xl text-xs"
                >
                  Submit First Bug
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-y border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Ticket ID</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Subject & Details</th>
                      <th className="py-3 px-4">Attachments</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredMyTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px] text-red-600 font-bold">
                          #{ticket.id}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
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
                        <td className="py-3.5 px-4">
                          {ticket.attachmentsCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
                              <Paperclip className="h-3 w-3 text-red-500" />
                              <span>{ticket.attachmentsCount} file{ticket.attachmentsCount > 1 ? 's' : ''}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">None</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                              ticket.status === 'Resolved'
                                ? 'text-emerald-600'
                                : ticket.status === 'In Progress'
                                ? 'text-amber-600'
                                : 'text-slate-600'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                ticket.status === 'Resolved' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                              }`}
                            />
                            {ticket.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-[11px] text-slate-400">
                          {ticket.submittedAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserRoleView;
