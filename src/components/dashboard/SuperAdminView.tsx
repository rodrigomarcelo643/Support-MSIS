import React, { useState } from 'react';
import type { SupportTicket } from '../../types';
import { Card } from '../ui/card';
import {
  ShieldAlert,
  GraduationCap,
  Briefcase,
  Users,
  Paperclip,
  Eye,
  Filter,
  Search,
  CheckCircle
} from 'lucide-react';

interface SuperAdminViewProps {
  tickets: SupportTicket[];
  onStatusChange: (ticketId: string, newStatus: SupportTicket['status']) => void;
  activeFilterRole?: string;
  onFilterRoleChange?: (role: string) => void;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  tickets,
  onStatusChange,
  activeFilterRole = 'all',
  onFilterRoleChange,
}) => {
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>(activeFilterRole);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const handleRoleSelect = (role: string) => {
    setSelectedRoleFilter(role);
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

  return (
    <div className="space-y-6">
      {/* Super Admin Notice Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
            SA
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Super Admin Central Console
              <span className="text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200/60 px-2 py-0.5 rounded-full">
                Core Tracking
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Audit and manage all technical issues across Student, Faculty, Secretary, and Admin submissions (Read-only for ticket submission)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Ingest Stream</span>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="default" className="p-4 bg-white border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-slate-500">All Tracked Issues</span>
            <div className="h-7 w-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Eye className="h-3.5 w-3.5" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{tickets.length}</span>
          <p className="text-[10px] text-slate-400 mt-0.5">Across 4 user categories</p>
        </Card>

        <Card variant="default" className="p-4 bg-white border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-slate-500">Student & Faculty</span>
            <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-slate-900">
            {tickets.filter((t) => t.category === 'Student' || t.category === 'Faculty').length}
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">Academic submissions</p>
        </Card>

        <Card variant="default" className="p-4 bg-white border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-slate-500">Staff & Admin</span>
            <div className="h-7 w-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldAlert className="h-3.5 w-3.5" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-slate-900">
            {tickets.filter((t) => t.category === 'Secretary' || t.category === 'Admin').length}
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">Operational submissions</p>
        </Card>

        <Card variant="default" className="p-4 bg-white border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-slate-500">Resolution Rate</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="h-3.5 w-3.5" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-slate-900">95.8%</span>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Within SLA window</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Role Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedRoleFilter === role.id ||
                selectedRoleFilter === `${role.id}-tickets`
                  ? 'bg-slate-900 text-white shadow-xs'
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
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, subject, dept..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Main Super Admin Table */}
      <Card variant="default" className="bg-white border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
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
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-red-600 font-bold">
                    #{ticket.id}
                  </td>
                  <td className="py-3.5 px-4">{getRoleBadge(ticket.category)}</td>
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
                    <select
                      value={ticket.status}
                      onChange={(e) =>
                        onStatusChange(ticket.id, e.target.value as SupportTicket['status'])
                      }
                      className="text-xs font-semibold py-1 px-2 rounded-lg border border-slate-200 bg-white text-slate-700 outline-none focus:border-red-500 cursor-pointer shadow-xs"
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Investigating">Investigating</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Dispatched">Dispatched</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(ticket)}
                      className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Ticket Inspection Modal for Super Admin */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-red-600">
                  #{selectedTicket.id}
                </span>
                {getRoleBadge(selectedTicket.category)}
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Department
                </span>
                <span className="font-semibold text-slate-800 text-sm">
                  {selectedTicket.department}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Subject
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedTicket.subject}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Description & Reproduction Details
                </span>
                <p className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 leading-relaxed mt-1">
                  {selectedTicket.description}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Attached Files ({selectedTicket.attachmentsCount})
                </span>
                <div className="p-2.5 rounded-xl border border-slate-200/80 bg-white flex items-center gap-2 text-slate-600 mt-1">
                  <Paperclip className="h-4 w-4 text-red-600" />
                  <span>
                    {selectedTicket.attachmentsCount > 0
                      ? `${selectedTicket.attachmentsCount} verified attachment files ready for download`
                      : 'No files attached'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onStatusChange(selectedTicket.id, 'Resolved');
                  setSelectedTicket(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminView;
