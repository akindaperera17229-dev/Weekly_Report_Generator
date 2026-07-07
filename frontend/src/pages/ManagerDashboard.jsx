import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, AreaChart, Area
} from 'recharts';
import { 
  Users, CheckCircle2, AlertTriangle, Calendar, Filter, 
  Search, Briefcase, FileSpreadsheet, Eye, Bot, RefreshCw
} from 'lucide-react';
import AiChatAssistant from '../components/AiChatAssistant';

export default function ManagerDashboard() {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [teamReports, setTeamReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d.setDate(diff));
    return mon.toISOString().split('T')[0];
  });
  const [filterMemberId, setFilterMemberId] = useState('');
  const [filterProjectId, setFilterProjectId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

  // Selected report for modal detail view
  const [selectedReportDetail, setSelectedReportDetail] = useState(null);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchDashboardStats();
    fetchFilteredReports();
  }, [selectedWeek, filterMemberId, filterProjectId, filterStatus, filterDateStart, filterDateEnd]);

  const fetchMetadata = async () => {
    try {
      const projs = await api.projects.getAll();
      setProjects(projs);
      
      // Load members (from reports list, or we can fetch team reports and extract distinct users)
      const reps = await api.reports.getTeamReports();
      const distinctUsers = [];
      const seen = new Set();
      reps.forEach(r => {
        if (!seen.has(r.userId)) {
          seen.add(r.userId);
          distinctUsers.push({ id: r.userId, name: r.userName });
        }
      });
      setMembers(distinctUsers);
    } catch (e) {
      console.error("Failed to fetch filters metadata", e);
    }
  };

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const data = await api.dashboard.getStats(selectedWeek);
      setStats(data);
    } catch (e) {
      console.error("Failed to load dashboard stats", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredReports = async () => {
    try {
      const filters = {
        userId: filterMemberId || null,
        projectId: filterProjectId || null,
        startDate: filterDateStart || null,
        endDate: filterDateEnd || null,
        status: filterStatus || null
      };
      
      // If no specific date filter range is selected, default list should be reports for selectedWeek
      if (!filterDateStart && !filterDateEnd && selectedWeek) {
        filters.startDate = selectedWeek;
        const range = getWeekRange(selectedWeek);
        filters.endDate = range.end;
      }

      const data = await api.reports.getTeamReports(filters);
      setTeamReports(data);
    } catch (e) {
      console.error("Failed to fetch reports list", e);
    }
  };

  const getWeekRange = (dateStr) => {
    if (!dateStr) return { start: '', end: '' };
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0]
    };
  };

  const resetFilters = () => {
    setFilterMemberId('');
    setFilterProjectId('');
    setFilterStatus('');
    setFilterDateStart('');
    setFilterDateEnd('');
  };

  // Recharts color palettes
  const PIE_COLORS = ['#3b82f6', '#e2e8f0']; // Blue for Submitted, Slate for Pending
  const BAR_COLORS = ['#6366f1', '#4f46e5', '#4338ca', '#3730a3'];

  // Formatting chart data
  const pieData = stats ? [
    { name: 'Submitted', value: stats.submittedCount },
    { name: 'Pending', value: stats.pendingCount }
  ] : [];

  const barData = stats ? stats.projectDistribution.map(p => ({
    name: p.projectName,
    Reports: p.reportCount,
    Hours: p.totalHours
  })) : [];

  const trendData = stats ? stats.weeklyTrend.map(t => ({
    week: t.weekLabel,
    Submissions: t.submittedCount,
    Hours: t.totalHours
  })) : [];

  return (
    <div className="space-y-8">
      
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-display">
            Team Activity Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time analytics, report compliance tracking, and conversational AI insights.
          </p>
        </div>

        {/* Selected Week Picker */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2 shadow-sm self-start">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-550 dark:text-slate-400">Week Start:</span>
          <input
            type="date"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-850 dark:text-slate-150 font-bold outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* 3 Metric Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Card 1: Compliance */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Report Compliance</p>
              <h3 className="text-3xl font-black text-slate-850 dark:text-slate-100 font-display">
                {stats.complianceRate.toFixed(0)}%
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {stats.submittedCount} of {stats.totalMembers} members submitted
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Open Blockers */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Blockers</p>
              <h3 className="text-3xl font-black text-slate-850 dark:text-slate-100 font-display">
                {stats.openBlockersCount}
              </h3>
              <p className="text-[10px] text-slate-550 dark:text-slate-400">
                Open challenges flagged by team
              </p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-2xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Pending Count */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Reports</p>
              <h3 className="text-3xl font-black text-slate-850 dark:text-slate-100 font-display">
                {stats.pendingCount}
              </h3>
              <p className="text-[10px] text-slate-550 dark:text-slate-400">
                Awaiting submissions this week
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics / Charts Grid */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie: Compliance Distribution */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
            <div>
              <h3 className="font-bold text-sm text-slate-805 dark:text-slate-200 font-display uppercase tracking-wider">
                Submission Ratio
              </h3>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1">Submitted vs Pending</p>
            </div>
            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Reports`, 'Status']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <span className="text-xl font-black text-slate-800 dark:text-slate-100 font-display">
                  {stats.submittedCount}/{stats.totalMembers}
                </span>
                <p className="text-[9px] text-slate-450 uppercase font-semibold">Submitted</p>
              </div>
            </div>
            <div className="flex justify-center gap-6 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-slate-700 dark:text-slate-350">Submitted ({stats.submittedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                <span className="text-slate-700 dark:text-slate-350">Pending ({stats.pendingCount})</span>
              </div>
            </div>
          </div>

          {/* Bar: Tasks / Hours by Project */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[300px] lg:col-span-1">
            <div>
              <h3 className="font-bold text-sm text-slate-805 dark:text-slate-200 font-display uppercase tracking-wider">
                Workload Distribution
              </h3>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1">Logged hours by project</p>
            </div>
            <div className="h-48 w-full mt-2">
              {barData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">No project activity logged</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ left: -20, right: 10, bottom: 0, top: 10 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip formatter={(value, name) => [`${value}`, name]} />
                    <Bar dataKey="Hours" fill="#6366f1" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Line/Area: Submission Trend */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[300px] lg:col-span-1">
            <div>
              <h3 className="font-bold text-sm text-slate-805 dark:text-slate-200 font-display uppercase tracking-wider">
                Submission Trend
              </h3>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1">Weekly reports submitted over time</p>
            </div>
            <div className="h-48 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ left: -20, right: 10, bottom: 0, top: 10 }}>
                  <defs>
                    <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={8} />
                  <YAxis stroke="#94a3b8" fontSize={9} />
                  <Tooltip />
                  <Area type="monotone" dataKey="Submissions" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSubmissions)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Compliance / Status Tracking List */}
      {stats && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-sm text-slate-805 dark:text-slate-200 font-display uppercase tracking-wider mb-4">
            Team Submission Compliance Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {stats.memberStatuses.map((m) => (
              <div
                key={m.userId}
                className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-2xl flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">{m.userName}</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5">{m.submittedAt === '-' ? 'No submission' : `Submitted: ${m.submittedAt}`}</p>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  m.status === 'SUBMITTED' 
                    ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400' 
                    : m.status === 'DRAFT'
                    ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'
                    : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                }`}>
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports Filter & Search Hub */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-850">
          <h3 className="font-bold text-sm text-slate-805 dark:text-slate-200 font-display uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-4.5 h-4.5 text-slate-400" />
            Report Filter Hub
          </h3>
          <button
            onClick={resetFilters}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 focus:outline-none"
          >
            <RefreshCw className="w-3 h-3" />
            Reset Filters
          </button>
        </div>

        {/* Filters Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {/* Member */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Team Member</label>
            <select
              value={filterMemberId}
              onChange={(e) => setFilterMemberId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none"
            >
              <option value="">All Members</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Project */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project</label>
            <select
              value={filterProjectId}
              onChange={(e) => setFilterProjectId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none"
            >
              <option value="">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="SUBMITTED">SUBMITTED</option>
            </select>
          </div>

          {/* Date range start */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
            <input
              type="date"
              value={filterDateStart}
              onChange={(e) => setFilterDateStart(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-850 dark:text-slate-150 outline-none"
            />
          </div>

          {/* Date range end */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date</label>
            <input
              type="date"
              value={filterDateEnd}
              onChange={(e) => setFilterDateEnd(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-855 dark:text-slate-150 outline-none"
            />
          </div>
        </div>

        {/* Reports Table / List */}
        <div className="mt-6 border border-slate-150 dark:border-slate-850 rounded-2xl overflow-hidden">
          {teamReports.length === 0 ? (
            <div className="text-center py-12 text-slate-450 dark:text-slate-550 text-xs">
              No reports match your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-955 text-slate-400 border-b border-slate-150 dark:border-slate-850">
                    <th className="p-3.5 font-bold uppercase tracking-wider">Member</th>
                    <th className="p-3.5 font-bold uppercase tracking-wider">Project</th>
                    <th className="p-3.5 font-bold uppercase tracking-wider">Week Range</th>
                    <th className="p-3.5 font-bold uppercase tracking-wider">Blockers</th>
                    <th className="p-3.5 font-bold uppercase tracking-wider text-center">Hours</th>
                    <th className="p-3.5 font-bold uppercase tracking-wider text-center">Status</th>
                    <th className="p-3.5 font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {teamReports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-slate-50/45 dark:hover:bg-slate-955/20 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-850 dark:text-slate-200">
                        {rep.userName}
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-350">{rep.projectName}</td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400">
                        {rep.weekStart} to {rep.weekEnd}
                      </td>
                      <td className="p-3.5">
                        {rep.blockers && rep.blockers.toLowerCase() !== 'none' ? (
                          <span className="inline-flex items-center gap-1 text-red-650 dark:text-red-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            {rep.blockers}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-750 dark:text-slate-300">
                        {rep.hoursWorked !== null ? rep.hoursWorked : '-'}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          rep.status === 'SUBMITTED' 
                            ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400' 
                            : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'
                        }`}>
                          {rep.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedReportDetail(rep)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Feed */}
      {stats && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-805 dark:text-slate-200 font-display uppercase tracking-wider">
            Recent Submissions Activity
          </h3>
          <div className="space-y-3">
            {stats.recentActivities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No recent submissions logged.</p>
            ) : (
              stats.recentActivities.map((act, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-3.5 bg-slate-50 dark:bg-slate-955 rounded-2xl">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{act.userName}</span>
                    <span className="text-slate-450 dark:text-slate-400 mx-1">submitted report for</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{act.projectName}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{act.submittedAt}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Floating AI chat drawer widget */}
      <AiChatAssistant weekStart={selectedWeek} />

      {/* Detail Modal View */}
      {selectedReportDetail && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-sm z-50 p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-850">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-display">
                  Report Details: {selectedReportDetail.userName}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Week range: {selectedReportDetail.weekStart} to {selectedReportDetail.weekEnd}
                </p>
              </div>
              <button
                onClick={() => setSelectedReportDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Grid */}
            <div className="space-y-4 text-xs">
              <div>
                <strong className="text-slate-500 dark:text-slate-400 block mb-1">Project</strong>
                <p className="p-3 bg-slate-50 dark:bg-slate-955 rounded-xl text-slate-800 dark:text-slate-250">
                  {selectedReportDetail.projectName}
                </p>
              </div>

              <div>
                <strong className="text-slate-500 dark:text-slate-400 block mb-1">Tasks Completed</strong>
                <p className="p-3 bg-slate-50 dark:bg-slate-955 rounded-xl text-slate-800 dark:text-slate-250 whitespace-pre-line leading-relaxed">
                  {selectedReportDetail.tasksCompleted}
                </p>
              </div>

              <div>
                <strong className="text-slate-500 dark:text-slate-400 block mb-1">Tasks Planned</strong>
                <p className="p-3 bg-slate-50 dark:bg-slate-955 rounded-xl text-slate-800 dark:text-slate-250 whitespace-pre-line leading-relaxed">
                  {selectedReportDetail.tasksPlanned}
                </p>
              </div>

              <div>
                <strong className="text-slate-500 dark:text-slate-400 block mb-1">Blockers / Challenges</strong>
                <p className={`p-3 rounded-xl whitespace-pre-line leading-relaxed ${
                  selectedReportDetail.blockers && selectedReportDetail.blockers.toLowerCase() !== 'none'
                    ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-105 dark:border-red-950'
                    : 'bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-250'
                }`}>
                  {selectedReportDetail.blockers || 'None'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong className="text-slate-500 dark:text-slate-400 block mb-1">Hours Logged</strong>
                  <p className="p-3 bg-slate-50 dark:bg-slate-955 rounded-xl text-slate-800 dark:text-slate-250 font-bold">
                    {selectedReportDetail.hoursWorked !== null ? selectedReportDetail.hoursWorked : '-'}
                  </p>
                </div>
                <div>
                  <strong className="text-slate-500 dark:text-slate-400 block mb-1">Notes / References</strong>
                  <p className="p-3 bg-slate-50 dark:bg-slate-955 rounded-xl text-slate-800 dark:text-slate-250 truncate">
                    {selectedReportDetail.notes ? (
                      selectedReportDetail.notes.startsWith('http') ? (
                        <a href={selectedReportDetail.notes} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                          {selectedReportDetail.notes}
                        </a>
                      ) : (
                        selectedReportDetail.notes
                      )
                    ) : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-850">
              <button
                onClick={() => setSelectedReportDetail(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
