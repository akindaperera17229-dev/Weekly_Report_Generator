import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Calendar, Briefcase, FileText, CheckCircle, HelpCircle, 
  Clock, Link as LinkIcon, History, AlertCircle, Save, Send, LogOut, FileCheck 
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Aurora from '../components/Aurora';

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

  // Calculate completeness progress
  const getCompletenessScore = () => {
    let score = 0;
    if (projectId) score += 20;
    if (tasksCompleted && tasksCompleted.trim().length > 5) score += 30;
    if (tasksPlanned && tasksPlanned.trim().length > 5) score += 25;
    if (blockers && blockers.trim().length > 2) score += 15;
    if (hoursWorked) score += 10;
    return score;
  };
  const completeness = getCompletenessScore();

  const user = api.auth.getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 relative overflow-hidden">
      {/* Aurora Veil Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[300px] bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent dark:from-indigo-500/5 pointer-events-none z-0"></div>

      {/* Top Navbar */}
      <header className="sticky top-0 bg-white/80  dark:bg-slate-950/70 backdrop-blur-xl border-b border-indigo-500/20 z-40 shadow-lg shadow-indigo-500/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="9" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/>
              <rect x="14" y="3" width="7" height="5" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/>
              <rect x="3" y="16" width="7" height="5" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/>
              <rect x="14" y="12" width="7" height="9" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/>
              <path d="M7 10L10 7L13 10L17 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"/>
            </svg>
            <span className="font-extrabold text-lg text-slate-800 dark:text-slate-100 tracking-tight font-display">
              SISENCO Report Hub
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role === 'MANAGER' ? 'Manager' : 'Team Member'}</p>
            </div>
            
            {user?.role === 'MANAGER' && (
              <Link
                to="/manager"
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-colors"
              >
                Manager Dashboard
              </Link>
            )}
             <ThemeToggle />

             <button
               onClick={onLogout}
               className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-red-50 dark:bg-slate-900 dark:hover:bg-red-950/20 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-205 text-xs font-semibold focus:outline-none"
             >
               <LogOut className="w-4 h-4" />
               <span>Log Out</span>
             </button>
           </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Left 2 Columns: Submission Form */}
        <section className="lg:col-span-2 space-y-6">
          
          {/* Welcome banner */}
          <div className="relative rounded-3xl p-6 shadow-md shadow-indigo-500/10 space-y-2 overflow-hidden transition-all duration-300 hover:scale-[1.005] bg-slate-900 border border-slate-800 text-white min-h-[140px] flex flex-col justify-center">
            <Aurora
                colorStops={["#092c54", "#1a0241", "#060d94"]}
                amplitude={1.2}
                blend={0.85}
              />
            <div className="relative z-10">
              <h2 className="text-xl font-bold font-display text-white">Hello, {user?.name}! 👋</h2>
              <p className="text-xs text-indigo-100 opacity-90 leading-relaxed max-w-md mt-1">
                Keep your team aligned! Draft or submit your weekly achievements and plans below.
              </p>
            </div>
            <div className="absolute right-6 bottom-0 top-0 flex items-center justify-center opacity-10 pointer-events-none text-[8rem] z-10">
              📊
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-premium">
            
            {/* Form Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-display flex items-center gap-2">
                  <FileCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  Weekly Work Report
                </h1>
                <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                  Submit a structured report. Drafts can be updated anytime.
                </p>
              </div>
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold self-start border border-indigo-100 dark:border-indigo-900/50">
                Status: {formStatus}
              </div>
            </div>

            {/* Notification alert */}
            {message.text && (
              <div className={`mt-4 p-4 rounded-2xl text-xs flex items-start gap-2 border ${
                message.type === 'error'
                  ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400'
                  : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 text-green-700 dark:text-green-400'
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
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    Select Week
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 pl-1">
                    Normalized: {weekStart} to {weekEnd}
                  </p>
                </div>

                {/* Project selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                    Project / Work Category
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
              <div className="space-y-1.5 p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  Tasks Completed This Week
                </label>
                <textarea
                  required
                  rows={4}
                  value={tasksCompleted}
                  onChange={(e) => setTasksCompleted(e.target.value)}
                  placeholder="Summarize the tasks you successfully completed this week..."
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none shadow-sm"
                />
              </div>

              {/* Tasks Planned */}
              <div className="space-y-1.5 p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  Tasks Planned for Next Week
                </label>
                <textarea
                  required
                  rows={3}
                  value={tasksPlanned}
                  onChange={(e) => setTasksPlanned(e.target.value)}
                  placeholder="Outline your planned goals for the upcoming week..."
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none shadow-sm"
                />
              </div>

              {/* Blockers */}
              <div className="space-y-1.5 p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-red-500" />
                  Blockers / Challenges
                </label>
                <textarea
                  required
                  rows={2}
                  value={blockers}
                  onChange={(e) => setBlockers(e.target.value)}
                  placeholder="Any active blockers or help needed? Write 'None' if clear."
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none shadow-sm"
                />
              </div>

              {/* Optional Row: Hours Worked & Notes/Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Hours worked */}
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
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
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Notes/Links */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
                    Notes / Reference Links (Opt)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional context or links (Figma, GitHub, Docs)"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
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
                  className="flex items-center gap-1.5 px-6 py-3 bg-indigo-600 hover:bg-indigo-750 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/15 hover:scale-[1.01] transition-all duration-200 focus:outline-none disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Report</span>
                </button>
              </div>

            </div>

          </div>
        </section>

        {/* Right 1 Column: Dashboard Checklist & History */}
        <section className="space-y-6">
          
          {/* Completeness Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-premium space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 font-display uppercase tracking-wider">
              <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl">📊</span>
              Completeness Meter
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Score</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{completeness}% Complete</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    completeness < 50 
                      ? 'bg-red-500' 
                      : completeness < 85 
                      ? 'bg-amber-500' 
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${completeness}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Submit a complete report to give your manager accurate project timelines.
              </p>
            </div>
          </div>

          {/* Submission History */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-premium">
            
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight font-display mb-4 flex items-center gap-2 uppercase tracking-wider">
              <History className="w-4.5 h-4.5 text-slate-500" />
              Report History
            </h2>
            
            {history.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                No past reports logged yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {history.map((rep) => (
                  <div
                    key={rep.id}
                    onClick={() => handleEditHistory(rep)}
                    className="p-3.5 bg-slate-50 hover:bg-indigo-50/40 dark:bg-slate-900/50 dark:hover:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl cursor-pointer transition-all duration-150 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-205 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
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
                      <strong className="text-slate-600 dark:text-slate-400 font-semibold">Project:</strong> {rep.projectName}<br />
                      <strong className="text-slate-600 dark:text-slate-400 font-semibold">Done:</strong> {rep.tasksCompleted}
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
