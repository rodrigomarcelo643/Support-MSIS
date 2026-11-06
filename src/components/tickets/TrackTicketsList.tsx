import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SupportTicket, UserRole } from '../../types';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useTickets } from '../../context/TicketsContext';
import { TrackTicketsSkeleton, usePageSkeleton } from '../ui/skeleton';
import {
  Ticket,
  PlusCircle,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Paperclip,
  Tag,
  Filter
} from 'lucide-react';

interface TrackTicketsListProps {
  currentRole: UserRole;
  roleSlug: string;
}

export const TrackTicketsList: React.FC<TrackTicketsListProps> = ({ currentRole, roleSlug }) => {
  const navigate = useNavigate();
  const { getTicketsForRole } = useTickets();
  const isLoading = usePageSkeleton(250);
  const [ticketSearch, setTicketSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | SupportTicket['status']>('All');

  if (isLoading) {
    return <TrackTicketsSkeleton />;
  }

  const roleTickets = getTicketsForRole(currentRole);

  const filteredTickets = roleTickets.filter((t) => {
    const matchesSearch =
      !ticketSearch.trim() ||
      t.subject.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.department.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.id.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(ticketSearch.toLowerCase());

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
            <Clock className="h-3 w-3 text-amber-500 animate-pulse" />
            In Progress
          </span>
        );
      case 'Investigating':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200/60">
            <AlertCircle className="h-3 w-3 text-sky-500" />
            Investigating
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle className="h-3 w-3 text-emerald-600" />
            Resolved
          </span>
        );
      case 'Dispatched':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
            <Tag className="h-3 w-3 text-purple-600" />
            Dispatched
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Ticket className="h-5 w-5 text-red-600" />
            <span>Track My Tickets</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700">
              {roleTickets.length} Filed
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status updates and triage monitoring for all {currentRole} submissions.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate(`/${roleSlug}/submit`)}
          leftIcon={<PlusCircle className="h-3.5 w-3.5" />}
          className="rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shrink-0"
        >
          Submit Ticket
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={ticketSearch}
            onChange={(e) => setTicketSearch(e.target.value)}
            placeholder="Search by ticket ID, subject, department..."
            className="w-full bg-white border border-slate-200/90 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 shadow-xs transition-all"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 pl-1 pr-1.5 shrink-0">
            <Filter className="h-3 w-3" /> Status:
          </span>
          {(['All', 'In Progress', 'Investigating', 'Resolved', 'Dispatched'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((t) => (
            <Card
              key={t.id}
              variant="default"
              className="bg-white border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-red-300 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                      {t.id}
                    </span>
                    {t.department && (
                      <>
                        <span className="text-xs text-slate-400 font-medium">•</span>
                        <span className="text-xs font-semibold text-slate-700">
                          {t.department}
                        </span>
                      </>
                    )}
                    <span className="text-xs text-slate-400 font-medium">•</span>
                    <span className="text-[11px] text-slate-400">
                      {t.submittedAt}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                    {t.subject}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {t.description}
                  </p>
                </div>

                <div className="flex items-center sm:flex-col items-end justify-between gap-2.5 shrink-0">
                  {getStatusBadge(t.status)}

                  {t.attachmentsCount > 0 && (
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      <Paperclip className="h-3 w-3 text-slate-400" />
                      {t.attachmentsCount} file{t.attachmentsCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card variant="default" className="bg-white border-slate-200/90 rounded-3xl p-12 text-center shadow-xs space-y-4">
            <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Ticket className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">No Tickets Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {ticketSearch || statusFilter !== 'All'
                  ? 'No tickets match your search filters. Try clearing filters.'
                  : `You have not submitted any bug reports or requests under ${currentRole} yet.`}
              </p>
            </div>
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
          </Card>
        )}
      </div>
    </div>
  );
};
