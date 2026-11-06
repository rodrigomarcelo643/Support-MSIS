import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { FileUpload, type UploadedFile } from '../ui/file-upload';
import { useTickets } from '../../context/TicketsContext';
import { SubmitTicketSkeleton, usePageSkeleton } from '../ui/skeleton';
import {
  Send,
  Ticket,
  CheckCircle2,
  Paperclip,
  GraduationCap,
  Briefcase,
  Users,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface SubmitTicketFormProps {
  currentRole: UserRole;
  roleSlug: string;
}

export const SubmitTicketForm: React.FC<SubmitTicketFormProps> = ({ currentRole, roleSlug }) => {
  const navigate = useNavigate();
  const { submitTicket } = useTickets();
  const isLoading = usePageSkeleton(250);

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  if (isLoading) {
    return <SubmitTicketSkeleton />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const ticket = await submitTicket({
        subject,
        description,
        files,
        category: (currentRole === 'Super Admin' ? 'Admin' : currentRole) as 'Student' | 'Faculty' | 'Secretary' | 'Admin',
      });

      setSubmittedId(ticket.id);
      setSubject('');
      setDescription('');
      setFiles([]);
    } catch (err) {
      console.error('Failed to submit ticket:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = () => {
    switch (currentRole) {
      case 'Student':
        return <GraduationCap className="h-4 w-4 text-red-600" />;
      case 'Faculty':
        return <Briefcase className="h-4 w-4 text-red-600" />;
      case 'Secretary':
        return <Users className="h-4 w-4 text-red-600" />;
      case 'Admin':
      case 'Super Admin':
        return <ShieldAlert className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
            {getRoleIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
              <span className="whitespace-nowrap">Submit New Ticket</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 whitespace-nowrap">
                {currentRole} Portal
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate">
              Provide incident details and attachments for technical support.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/${roleSlug}/tickets`)}
          leftIcon={<Ticket className="h-3.5 w-3.5" />}
          className="rounded-xl text-xs shrink-0 hidden sm:flex whitespace-nowrap"
        >
          Track Tickets
        </Button>
      </div>

      {submittedId ? (
        <Card variant="default" className="bg-white border-slate-200/90 shadow-sm p-5 sm:p-8 text-center space-y-3 sm:space-y-4 rounded-2xl sm:rounded-3xl">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Support Ticket Successfully Logged</h3>
            <p className="text-xs text-slate-500">
              Your ticket has been recorded under the {currentRole} queue:
            </p>
            <p className="text-xl sm:text-2xl font-mono font-bold text-red-600 pt-1">
              #{submittedId}
            </p>
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            MSIS technicians have received your report and telemetry. You can follow live status updates in your tracking page.
          </p>
          <div className="pt-2 sm:pt-3 flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-3 w-full max-w-xs sm:max-w-none mx-auto">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/${roleSlug}/tickets`)}
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              className="rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto justify-center whitespace-nowrap"
            >
              Go to Track My Tickets
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSubmittedId(null)}
              className="rounded-xl w-full sm:w-auto justify-center whitespace-nowrap"
            >
              Submit Another Report
            </Button>
          </div>
        </Card>
      ) : (
        <Card variant="default" className="bg-white border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-2xl sm:rounded-3xl overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900">
              Technical Request & Incident Details
            </CardTitle>
            <CardDescription className="text-[11px] sm:text-xs text-slate-500">
              Please provide a descriptive subject, replication steps, and any error screenshots or logs.
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
                  placeholder="e.g. Grade export throwing 500 error on Section 2"
                  className="h-10 sm:h-11 px-3.5 text-xs bg-white text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Detailed Description */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Description / Replication Steps <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what occurred, URL/page accessed, error message displayed, and steps taken..."
                  className="p-3 sm:p-3.5 text-xs bg-white text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all resize-none placeholder:text-slate-400"
                />
              </div>

              {/* Attachments Section */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Paperclip className="h-3.5 w-3.5 text-slate-400" />
                  <span>Attachments (Screenshots, Logs, Documents)</span>
                </label>
                <FileUpload
                  files={files}
                  onFilesChange={setFiles}
                  maxFiles={5}
                  maxSizeMB={10}
                />
              </div>
            </CardContent>

            <CardFooter className="bg-slate-50/70 border-t border-slate-100 p-4 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 text-center sm:text-left">
                All fields marked with <span className="text-red-500">*</span> are mandatory.
              </span>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                leftIcon={<Send className="h-3.5 w-3.5" />}
                className="rounded-xl px-5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer w-full sm:w-auto justify-center whitespace-nowrap"
              >
                Submit Ticket
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
};
