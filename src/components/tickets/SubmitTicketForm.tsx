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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const ticket = submitTicket({
        subject,
        description,
        files,
        category: (currentRole === 'Super Admin' ? 'Admin' : currentRole) as 'Student' | 'Faculty' | 'Secretary' | 'Admin',
      });

      setSubmittedId(ticket.id);
      setIsSubmitting(false);
      setSubject('');
      setDescription('');
      setFiles([]);
    }, 600);
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
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
            {getRoleIcon()}
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Submit New Ticket</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                {currentRole} Portal
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Provide incident details and attachments for the technical support team.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/${roleSlug}/tickets`)}
          leftIcon={<Ticket className="h-3.5 w-3.5" />}
          className="rounded-xl text-xs shrink-0 hidden sm:flex"
        >
          Track Tickets
        </Button>
      </div>

      {submittedId ? (
        <Card variant="default" className="bg-white border-slate-200/90 shadow-sm p-8 text-center space-y-4 rounded-3xl">
          <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Support Ticket Successfully Logged</h3>
            <p className="text-xs text-slate-500">
              Your ticket has been recorded under the {currentRole} queue:
            </p>
            <p className="text-2xl font-mono font-bold text-red-600 pt-1">
              #{submittedId}
            </p>
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            MSIS technicians have received your bug report and telemetry. You can follow live status updates in your tracking page.
          </p>
          <div className="pt-3 flex flex-wrap justify-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/${roleSlug}/tickets`)}
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              className="rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white"
            >
              Go to Track My Tickets
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSubmittedId(null)}
              className="rounded-xl"
            >
              Submit Another Report
            </Button>
          </div>
        </Card>
      ) : (
        <Card variant="default" className="bg-white border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 p-6">
            <CardTitle className="text-base font-bold text-slate-900">
              Technical Request & Incident Details
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Please provide a descriptive subject, replication steps, and any error screenshots or logs.
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
                  placeholder="e.g. Grade export throwing 500 error on Section 2"
                  className="h-11 px-3.5 text-xs bg-white text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all placeholder:text-slate-400"
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
                  className="p-3.5 text-xs bg-white text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all resize-none placeholder:text-slate-400"
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

            <CardFooter className="bg-slate-50/70 border-t border-slate-100 p-4 sm:p-6 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                All fields marked with <span className="text-red-500">*</span> are mandatory.
              </span>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                leftIcon={<Send className="h-3.5 w-3.5" />}
                className="rounded-xl px-5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer"
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
