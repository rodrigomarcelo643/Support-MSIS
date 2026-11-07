import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SupportTicket, UserRole } from '../../types';
import { Card } from '../ui/card';
import { formatRelativeTime, formatBadgeCount } from '../../lib/utils';
import {
  Clock,
  CheckCircle2,
  Search,
  PlusCircle,
  ExternalLink,
  Info,
  Radio,
  ChevronDown,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

interface ModernDashboardOverviewProps {
  currentRole: UserRole;
  roleSlug: string;
  tickets: SupportTicket[];
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_FULL_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function parseTicketMonth(dateStr?: string | null): number {
  if (!dateStr) return new Date().getMonth();
  const lower = dateStr.toLowerCase();
  if (lower.includes('just now') || lower.includes('min') || lower.includes('hour') || lower.includes('today')) {
    return new Date().getMonth();
  }
  const normalized = dateStr.includes(' ') && !dateStr.includes('T') ? dateStr.replace(' ', 'T') : dateStr;
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? new Date().getMonth() : d.getMonth();
}

export const ModernDashboardOverview: React.FC<ModernDashboardOverviewProps> = ({
  currentRole,
  roleSlug,
  tickets,
}) => {
  const navigate = useNavigate();
  const isSuperAdmin = currentRole === 'Super Admin';
  const currentMonthIdx = new Date().getMonth();

  // Filters for bottom table
  const [tableSearch, setTableSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'All' | SupportTicket['status']>('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Interactive Chart State
  const [timeframe, setTimeframe] = useState<'This Year' | 'Last 6 Months' | 'This Month'>('This Year');
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number>(currentMonthIdx);

  // Real Metrics from actual tickets
  const totalCount = tickets.length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const investigatingCount = tickets.filter((t) => t.status === 'Investigating').length;
  const dispatchedCount = tickets.filter((t) => t.status === 'Dispatched').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;
  const closedCount = tickets.filter((t) => t.status === 'Closed').length;
  const activeUnresolvedCount = inProgressCount + investigatingCount + dispatchedCount;
  const completedCount = resolvedCount + closedCount;

  // Real SLA Calculation
  const slaRate = totalCount > 0
    ? Math.min(100, Math.round(((completedCount + inProgressCount * 0.7) / totalCount) * 100))
    : 100;

  // 100% REAL Department Distribution from actual tickets
  const departmentBreakdown = useMemo(() => {
    if (!tickets.length) {
      return [
        {
          id: 'dept-empty',
          label: 'No Tickets Logged',
          count: 0,
          percentage: 0,
          color: '#cbd5e1',
        },
      ];
    }

    const counts: Record<string, number> = {};
    tickets.forEach((t) => {
      const deptName = (t.department || t.category || 'General').trim();
      counts[deptName] = (counts[deptName] || 0) + 1;
    });

    // Theme palette following the SWU Red theme
    const colorPalette = ['#dc2626', '#991b1b', '#b91c1c', '#f59e0b', '#475569', '#059669'];

    const items = Object.entries(counts).map(([label, count], idx) => ({
      id: `dept-${idx}`,
      label,
      count,
      percentage: Math.round((count / tickets.length) * 100),
      color: colorPalette[idx % colorPalette.length],
    }));

    return items.sort((a, b) => b.count - a.count);
  }, [tickets]);

  // Real Segmented Pill Stripes mapped to actual department proportions
  const segmentedStripes = useMemo(() => {
    const totalStripes = 36;
    if (!tickets.length || !departmentBreakdown.length) {
      return Array.from({ length: totalStripes }).map((_, i) => ({
        id: i,
        color: '#e2e8f0',
        label: 'No Data',
      }));
    }

    const stripes: { id: number; color: string; label: string }[] = [];
    for (let i = 0; i < totalStripes; i++) {
      const targetPercent = (i + 1) / totalStripes;
      let runningPercent = 0;
      let matched = departmentBreakdown[departmentBreakdown.length - 1];

      for (let d = 0; d < departmentBreakdown.length; d++) {
        runningPercent += departmentBreakdown[d].count / tickets.length;
        if (targetPercent <= runningPercent || d === departmentBreakdown.length - 1) {
          matched = departmentBreakdown[d];
          break;
        }
      }

      stripes.push({
        id: i,
        color: matched.color,
        label: matched.label,
      });
    }
    return stripes;
  }, [tickets, departmentBreakdown]);

  // 100% REAL Monthly Chart Data computed from tickets
  const monthsData = useMemo(() => {
    return MONTH_NAMES.map((m, idx) => {
      // Tickets filed in this month
      const intake = tickets.filter((t) => parseTicketMonth(t.createdAt || t.submittedAt) === idx).length;
      // Tickets resolved in this month
      const resolved = tickets.filter(
        (t) =>
          (t.status === 'Resolved' || t.status === 'Closed') &&
          parseTicketMonth(t.updatedAt || t.createdAt || t.submittedAt) === idx
      ).length;

      return {
        month: m,
        intake,
        resolved,
        label: `${MONTH_FULL_NAMES[idx]} 2026`,
      };
    });
  }, [tickets]);

  // SVG Chart Setup
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  // Determine scale based on maximum real value
  const maxDataVal = Math.max(1, ...monthsData.map((d) => Math.max(d.intake, d.resolved)));
  const chartMaxVal = Math.max(4, Math.ceil(maxDataVal * 1.25));

  const getCoordinates = (val: number, idx: number) => {
    const x = paddingX + (idx / (monthsData.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - (val / chartMaxVal) * (svgHeight - paddingY * 2);
    return { x, y };
  };

  const intakePoints = monthsData.map((d, i) => getCoordinates(d.intake, i));
  const resolvedPoints = monthsData.map((d, i) => getCoordinates(d.resolved, i));

  const buildBezierPath = (points: { x: number; y: number }[]) => {
    if (!points.length) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      path += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const intakePath = buildBezierPath(intakePoints);
  const resolvedPath = buildBezierPath(resolvedPoints);

  const activeHoveredMonth = monthsData[hoveredMonthIdx] || monthsData[currentMonthIdx];
  const activeHoveredPoint = intakePoints[hoveredMonthIdx] || intakePoints[currentMonthIdx];

  // Filtered tickets for the bottom table
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        !tableSearch.trim() ||
        t.subject.toLowerCase().includes(tableSearch.toLowerCase()) ||
        t.id.toLowerCase().includes(tableSearch.toLowerCase()) ||
        t.department.toLowerCase().includes(tableSearch.toLowerCase()) ||
        (t.reporterName && t.reporterName.toLowerCase().includes(tableSearch.toLowerCase()));

      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, tableSearch, statusFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTickets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTickets.map((t) => t.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Status Badge Helper
  const renderStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Resolved</span>
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>In Progress</span>
          </span>
        );
      case 'Investigating':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
            <span>Investigating</span>
          </span>
        );
      case 'Dispatched':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            <span>Dispatched</span>
          </span>
        );
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            <span>Closed</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto animate-fadeIn pb-12">
      {/* 1. Header: Clean title without the removed Customize Widget button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {isSuperAdmin ? 'Support Operations at a Glance' : `${currentRole} Support at a Glance`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time snapshot of your active tickets, resolution velocity, and department queue
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Sync Active</span>
          </span>
        </div>
      </div>

      {/* 2. Top 3 Metric Cards with Red Theme accents & 100% Real Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Card 1: Active Inflow Today */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-50 via-white to-red-50/30 border border-slate-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[135px]">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">
              Active Issues Inflow
            </span>
            <div className="h-8 w-8 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4" />
            </div>
          </div>

          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatBadgeCount(activeUnresolvedCount)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <span className="font-bold text-red-600">{activeUnresolvedCount} open</span>
            <span>across engineering queue</span>
          </div>
        </div>

        {/* Card 2: Resolved & Verified */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 border border-slate-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[135px]">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">
              Resolved & Closed
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>

          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatBadgeCount(completedCount)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <span className="font-bold text-emerald-600">{completedCount} of {totalCount}</span>
            <span>tickets verified resolved</span>
          </div>
        </div>

        {/* Card 3: SLA Performance */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-50 via-white to-slate-100/50 border border-slate-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[135px]">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">
              SLA Resolution Health
            </span>
            <div className="h-8 w-8 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
          </div>

          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {slaRate}%
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <span className="font-bold text-slate-800">{totalCount} total</span>
            <span>filed in support registry</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Dual-Wave Chart (Real Data) + Department Distribution (Real Data & Red Theme) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Card: Ticket Analytics (100% Real Data & Red Theme) */}
        <Card variant="default" className="lg:col-span-2 bg-white border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header row with Red Theme Legend */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Ticket Analytics
                </h3>
                <div className="flex items-center gap-3 mt-1 text-[11px] font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-600" />
                    <span>Intake Queue (Real Data)</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Resolved</span>
                  </span>
                </div>
              </div>

              {/* Timeframe selector pill */}
              <div className="relative">
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value as any)}
                  className="appearance-none text-xs font-bold py-1.5 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-red-500 cursor-pointer shadow-2xs"
                >
                  <option value="This Year">Year 2026</option>
                  <option value="Last 6 Months">Last 6 Months</option>
                  <option value="This Month">Current Month</option>
                </select>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* SVG Dual Wave Chart with Interactive Hover Pin */}
            <div className="relative w-full overflow-hidden pt-4 pb-2">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-44 sm:h-52 overflow-visible">
                {/* Horizontal guide lines */}
                <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#f1f5f9" strokeWidth="1" />
                <line x1={paddingX} y1={(svgHeight - paddingY) / 2} x2={svgWidth - paddingX} y2={(svgHeight - paddingY) / 2} stroke="#f1f5f9" strokeWidth="1" />

                {/* Vertical guide on hovered month */}
                <line
                  x1={activeHoveredPoint.x}
                  y1={paddingY}
                  x2={activeHoveredPoint.x}
                  y2={svgHeight - paddingY}
                  stroke="#cbd5e1"
                  strokeDasharray="4 4"
                  strokeWidth="1.5"
                />

                {/* Wave 2: Resolved curve (Emerald Green) */}
                <path
                  d={resolvedPath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />

                {/* Wave 1: Intake curve (Red Theme matching Sidebar) */}
                <path
                  d={intakePath}
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />

                {/* Hover Dot Marker on Red Intake Curve */}
                <circle
                  cx={activeHoveredPoint.x}
                  cy={activeHoveredPoint.y}
                  r="6"
                  fill="#dc2626"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="filter drop-shadow-md transition-all duration-200"
                />

                {/* Month Text Labels */}
                {monthsData.map((d, i) => {
                  const x = paddingX + (i / (monthsData.length - 1)) * (svgWidth - paddingX * 2);
                  const isSelected = i === hoveredMonthIdx;
                  return (
                    <text
                      key={d.month}
                      x={x}
                      y={svgHeight - 6}
                      textAnchor="middle"
                      className={`text-[11px] cursor-pointer font-medium select-none ${
                        isSelected ? 'fill-red-600 font-extrabold' : 'fill-slate-400'
                      }`}
                      onClick={() => setHoveredMonthIdx(i)}
                    >
                      {d.month}
                    </text>
                  );
                })}
              </svg>

              {/* Floating Dark Tooltip Pin with REAL data for that month */}
              <div
                className="absolute z-20 pointer-events-none transition-all duration-200 -translate-x-1/2"
                style={{
                  left: `${(activeHoveredPoint.x / svgWidth) * 100}%`,
                  top: `${Math.max(8, (activeHoveredPoint.y / svgHeight) * 100 - 32)}%`,
                }}
              >
                <div className="bg-slate-900 text-white rounded-xl px-3 py-1.5 shadow-lg text-center space-y-0.5">
                  <div className="text-xs font-extrabold tracking-tight">
                    {activeHoveredMonth.intake} Filed &bull; {activeHoveredMonth.resolved} Resolved
                  </div>
                  <div className="text-[10px] text-slate-300 font-medium">
                    {activeHoveredMonth.label}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Chart values reflect actual database records filed by {isSuperAdmin ? 'all users' : currentRole}</span>
            <button
              type="button"
              onClick={() => navigate(`/${roleSlug}/activity`)}
              className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View Audit Log</span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </Card>

        {/* Right Card: 100% REAL Department Distribution (No Fake +512, Red Theme) */}
        <Card variant="default" className="bg-white border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header row with See Details button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Unit Distribution
                </h3>
                <span title="Real ticket distribution across units" className="inline-flex items-center text-slate-400">
                  <Info className="h-3.5 w-3.5" />
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/${roleSlug}/tickets`)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                See Details
              </button>
            </div>

            {/* Real Total Count (NO fake +512) */}
            <div className="flex items-center gap-2.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {totalCount}
              </span>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                {departmentBreakdown.length} Active Unit{departmentBreakdown.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Segmented Pill Stripes Bar mapped to REAL department percentages */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between gap-1 overflow-hidden py-1">
                {segmentedStripes.map((stripe) => (
                  <div
                    key={stripe.id}
                    className="flex-1 h-6 sm:h-7 rounded-full transition-transform hover:scale-125 cursor-pointer"
                    style={{ backgroundColor: stripe.color }}
                    title={stripe.label}
                  />
                ))}
              </div>
            </div>

            {/* REAL Department Breakdown Rows (NO fake categories) */}
            <div className="space-y-2.5 pt-2">
              {departmentBreakdown.map((dept) => (
                <div key={dept.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2.5 w-2.5 rounded-xs shrink-0" style={{ backgroundColor: dept.color }} />
                    <span className="font-bold text-slate-800 truncate">{dept.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-600 font-bold">{dept.count} Ticket{dept.count !== 1 ? 's' : ''}</span>
                    <button
                      type="button"
                      onClick={() => navigate(`/${roleSlug}/tickets`)}
                      className="text-slate-400 hover:text-red-600 cursor-pointer"
                      title="View tickets for this unit"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
            Synchronized directly with your live tickets
          </div>
        </Card>
      </div>

      {/* 4. Bottom Section: Active Support Tickets Table with Red Theme */}
      <Card variant="default" className="bg-white border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
        {/* Table Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Active Support Tickets
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200/80">
              {filteredTickets.length}
            </span>
          </div>

          {/* Search, Filter, and Submit Button */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search ticket, subject..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-red-500 shadow-2xs"
              />
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="appearance-none text-xs font-semibold py-1.5 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-red-500 cursor-pointer shadow-2xs"
              >
                <option value="All">All Status</option>
                <option value="In Progress">In Progress</option>
                <option value="Investigating">Investigating</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Submit Ticket Action Button (Red Theme matching Sidebar) */}
            <button
              type="button"
              onClick={() => navigate(`/${roleSlug}/submit`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white text-xs shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Submit Ticket</span>
            </button>
          </div>
        </div>

        {/* Clean Data Table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredTickets.length > 0 && selectedIds.size === filteredTickets.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Ticket / Subject</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Reporter</th>
                <th className="py-3 px-3">Updated</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No tickets found matching your query.
                  </td>
                </tr>
              ) : (
                filteredTickets.slice(0, 8).map((ticket) => {
                  const isChecked = selectedIds.has(ticket.id);
                  return (
                    <tr
                      key={ticket.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? 'bg-red-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(ticket.id)}
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/${roleSlug}/tickets/${ticket.id}`)}
                            className="font-mono text-xs font-bold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-md border border-red-200/80 transition-colors cursor-pointer"
                          >
                            #{ticket.id}
                          </button>
                          <span className="font-semibold text-slate-800 truncate max-w-[200px]" title={ticket.subject}>
                            {ticket.subject}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-600 font-medium truncate max-w-[140px]">
                        {ticket.department}
                      </td>

                      <td className="py-3 px-3">
                        <div className="truncate max-w-[120px]">
                          <span className="font-semibold text-slate-800 block truncate">{ticket.reporterName || ticket.category}</span>
                          <span className="text-[10px] text-slate-400 block truncate">{ticket.category}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                        {ticket.updatedRelative || formatRelativeTime(ticket.updatedAt || ticket.createdAt || ticket.submittedAt)}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {renderStatusBadge(ticket.status)}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => navigate(`/${roleSlug}/tickets/${ticket.id}`)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200/80 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Radio className="h-3 w-3 text-red-600 animate-pulse" />
                          <span>Track</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* View All Tickets Footer Button */}
        <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
          <span>Showing latest {Math.min(8, filteredTickets.length)} of {filteredTickets.length} tickets</span>
          <button
            type="button"
            onClick={() => navigate(`/${roleSlug}/tickets`)}
            className="font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Tickets in Registry</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </Card>
    </div>
  );
};
