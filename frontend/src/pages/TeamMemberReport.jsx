import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Calendar, Briefcase, FileText, CheckCircle, HelpCircle, 
  Clock, Link as LinkIcon, History, AlertCircle, Save, Send, LogOut, FileCheck 
} from 'lucide-react';

export default function TeamMemberReport({ onLogout }) {
  const [projects, setProjects] = useState([]);
  const [history, setHistory] = useState([]);
  
  // Form State
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to Monday of current week
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d.setDate(diff));
    return mon.toISOString().split('T')[0];
  });
  
  const [projectId, setProjectId] = useState('');
  const [tasksCompleted, setTasksCompleted] = useState('');
  const [tasksPlanned, setTasksPlanned] = useState('');
  const [blockers, setBlockers] = useState('');
  const [hoursWorked, setHoursWorked] = useState('');
  const [notes, setNotes] = useState('');
  const [formStatus, setFormStatus] = useState('DRAFT'); // "DRAFT" or "SUBMITTED"

  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Normalizing Monday-Sunday week
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

  const { start: weekStart, end: weekEnd } = getWeekRange(selectedDate);

  useEffect(() => {
    fetchProjects();
    fetchHistory();
  }, []);

  // When selectedDate changes, populate form with existing draft if it exists in history
  useEffect(() => {
    const existing = history.find(h => h.weekStart === weekStart);
    if (existing) {
      setProjectId(existing.projectId.toString());
      setTasksCompleted(existing.tasksCompleted || '');
      setTasksPlanned(existing.tasksPlanned || '');
      setBlockers(existing.blockers || '');
      setHoursWorked(existing.hoursWorked !== null ? existing.hoursWorked.toString() : '');
      setNotes(existing.notes || '');
      setFormStatus(existing.status);
    } else {
      // Clear form except project selection if no report exists for this week
      setTasksCompleted('');
      setTasksPlanned('');
      setBlockers('');
      setHoursWorked('');
      setNotes('');
      setFormStatus('DRAFT');
    }
  }, [selectedDate, history]);

  const fetchProjects = async () => {
    try {
      const data = await api.projects.getAll();
      setProjects(data);
      if (data.length > 0 && !projectId) {
        setProjectId(data[0].id.toString());
      }
    } catch (e) {
      showMsg('error', 'Failed to load projects');
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await api.reports.getMyHistory();
      setHistory(data);
    } catch (e) {
      showMsg('error', 'Failed to load report history');
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleSave = async (status) => {
    if (!projectId) {
      showMsg('error', 'Please select a project');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        projectId: parseInt(projectId),
        weekStart,
        weekEnd,
        tasksCompleted,
        tasksPlanned,
        blockers,
        hoursWorked: hoursWorked ? parseFloat(hoursWorked) : null,
        notes,
        status
      };
      await api.reports.submit(payload);
      showMsg('success', status === 'SUBMITTED' ? 'Report submitted successfully!' : 'Draft saved successfully!');
      fetchHistory();
    } catch (e) {
      showMsg('error', e.message || 'Failed to save report');
    } finally {
      setLoading(false);
    }
  };

  const handleEditHistory = (rep) => {
    setSelectedDate(rep.weekStart);
    setProjectId(rep.projectId.toString());
    setTasksCompleted(rep.tasksCompleted || '');
    setTasksPlanned(rep.tasksPlanned || '');
    setBlockers(rep.blockers || '');
    setHoursWorked(rep.hoursWorked !== null ? rep.hoursWorked.toString() : '');
    setNotes(rep.notes || '');
    setFormStatus(rep.status);
  };

  const user = api.auth.getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      
      {/* Top Navbar */}
      <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <span className="font-extrabold text-lg text-slate-800 dark:text-slate-100 tracking-tight font-display">
              SISENCO Report Hub
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-450">{user?.role === 'MANAGER' ? 'Manager' : 'Team Member'}</p>
            </div>
            
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-red-50 dark:bg-slate-900 dark:hover:bg-red-950/20 text-slate-600 dark:text-slate-350 hover:text-red-650 dark:hover:text-red-400 rounded-xl transition-all duration-200 text-xs font-semibold focus:outline-none"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Submission Form */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            
            {/* Form Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-850">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-display flex items-center gap-2">
                  <FileCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Weekly Work Report
                </h1>
                <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                  Submit a structured report. Drafts can be updated anytime.
                </p>
              </div>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold self-start">
                Status: {formStatus}
              </div>
            </div>

            {/* Notification alert */}
            {message.text && (
              <div className={`mt-4 p-4 rounded-2xl text-xs flex items-start gap-2 border ${
                message.type === 'error'
                  ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-700 dark:text-red-450'
                  : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 text-green-700 dark:text-green-450'
              }`}>
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{message.text}</span>
              </div>
            )}

            <div className="space-y-6 mt-6">
              
              {/* Row 1: Date selection & Project Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Week selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Select Week
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 pl-1">
                    Normalized: {weekStart} to {weekEnd}
                  </p>
                </div>

                {/* Project selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    Project / Work Category
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {projects.length === 0 ? (
                      <option value="">No projects created yet</option>
                    ) : (
                      projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))
                    )}
                  </select>
                </div>

              </div>

              {/* Tasks Completed */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  Tasks Completed This Week
                </label>
                <textarea
                  required
                  rows={4}
                  value={tasksCompleted}
                  onChange={(e) => setTasksCompleted(e.target.value)}
                  placeholder="Summarize the tasks you successfully completed this week..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Tasks Planned */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Tasks Planned for Next Week
                </label>
                <textarea
                  required
                  rows={3}
                  value={tasksPlanned}
                  onChange={(e) => setTasksPlanned(e.target.value)}
                  placeholder="Outline your planned goals for the upcoming week..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Blockers */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-red-500" />
                  Blockers / Challenges
                </label>
                <textarea
                  required
                  rows={2}
                  value={blockers}
                  onChange={(e) => setBlockers(e.target.value)}
                  placeholder="Any active blockers or help needed? Write 'None' if clear."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Optional Row: Hours Worked & Notes/Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Hours worked */}
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Hours Worked (Opt)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={hoursWorked}
                    onChange={(e) => setHoursWorked(e.target.value)}
                    placeholder="e.g. 40"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Notes/Links */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5" />
                    Notes / Reference Links (Opt)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional context or links (Figma, GitHub, Docs)"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSave('DRAFT')}
                  className="flex items-center gap-1.5 px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl transition-all duration-200 focus:outline-none disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Draft</span>
                </button>
                
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSave('SUBMITTED')}
                  className="flex items-center gap-1.5 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/15 hover:scale-[1.01] transition-all duration-200 focus:outline-none disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Report</span>
                </button>
              </div>

            </div>

          </div>
        </section>

        {/* Right 1 Column: Submission History */}
        <section className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight font-display mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-500" />
              Your Report History
            </h2>
            
            {history.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                No past reports logged yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {history.map((rep) => (
                  <div
                    key={rep.id}
                    onClick={() => handleEditHistory(rep)}
                    className="p-3.5 bg-slate-50 hover:bg-blue-50/40 dark:bg-slate-955 dark:hover:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl cursor-pointer transition-all duration-150 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-850 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Week: {rep.weekStart}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        rep.status === 'SUBMITTED' 
                          ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/50' 
                          : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50'
                      }`}>
                        {rep.status}
                      </span>
                    </div>
                    
                    <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      <strong className="text-slate-655 dark:text-slate-350">Project:</strong> {rep.projectName}<br />
                      <strong className="text-slate-655 dark:text-slate-350">Done:</strong> {rep.tasksCompleted}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </div>
        </section>

      </main>
      
    </div>
  );
}
