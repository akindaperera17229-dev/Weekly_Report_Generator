import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { api } from './services/api';
import Login from './pages/Login';
import Register from './pages/Register';
import TeamMemberReport from './pages/TeamMemberReport';
import ManagerDashboard from './pages/ManagerDashboard';
import ProjectManagement from './pages/ProjectManagement';
import ThemeToggle from './components/ThemeToggle';
import { LayoutDashboard, Briefcase, LogOut, Sparkles } from 'lucide-react';

// Protected Route wrapper for Team Members
function MemberRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  // Managers can also view member interface if they want, but let's allow it
  return children;
}

// Protected Route wrapper for Managers
function ManagerRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'MANAGER') return <Navigate to="/member" replace />;
  return children;
}

function ManagerLayout({ user, onLogout }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 flex flex-col md:flex-row">
      
      {/* Manager Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-850 flex flex-col shrink-0">
        
        {/* Sidebar Brand Header */}
        <div className="h-16 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2 px-6">
          <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="7" height="9" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/>
            <rect x="14" y="3" width="7" height="5" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/>
            <rect x="3" y="16" width="7" height="5" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/>
            <rect x="14" y="12" width="7" height="9" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/>
            <path d="M7 10L10 7L13 10L17 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"/>
          </svg>
          <span className="font-extrabold text-base text-slate-800 dark:text-slate-100 tracking-tight font-display">
            SISENCO Manager
          </span>
        </div>

        {/* User Info Card */}
        <div className="p-4 border-b border-slate-105 dark:border-slate-850">
          <div className="p-3 bg-slate-50 dark:bg-slate-955 rounded-2xl">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-250 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 truncate">{user?.email}</p>
            <div className="inline-flex mt-2 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-[9px] font-bold">
              Administrator
            </div>
          </div>
        </div>

        {/* Sidebar Nav links */}
        <nav className="flex-grow p-4 space-y-1.5">
          <Link
            to="/manager"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              location.pathname === '/manager'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Stats</span>
          </Link>

          <Link
            to="/manager/projects"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              location.pathname === '/manager/projects'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Manage Projects</span>
          </Link>
          
          <Link
            to="/member"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>View Member Page</span>
          </Link>
        </nav>

        {/* Sidebar footer control */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
          <ThemeToggle />
          
          <button
            onClick={onLogout}
            className="p-2 text-slate-450 hover:text-red-650 dark:hover:text-red-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors focus:outline-none"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

      </aside>

      {/* Main dashboard content layout wrapper */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        <Routes>
          <Route path="/" element={<ManagerDashboard />} />
          <Route path="/projects" element={<ProjectManagement />} />
        </Routes>
      </main>

    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const storedUser = api.auth.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setCheckingAuth(false);
  }, []);

  const handleLoginSuccess = (authData) => {
    setUser({
      name: authData.name,
      email: authData.email,
      role: authData.role
    });
  };

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route 
          path="/login" 
          element={
            user ? (
              <Navigate to={user.role === 'MANAGER' ? '/manager' : '/member'} replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            user ? (
              <Navigate to={user.role === 'MANAGER' ? '/manager' : '/member'} replace />
            ) : (
              <Register onLoginSuccess={handleLoginSuccess} />
            )
          } 
        />

        {/* Member route */}
        <Route 
          path="/member" 
          element={
            <MemberRoute user={user}>
              <TeamMemberReport onLogout={handleLogout} />
            </MemberRoute>
          } 
        />

        {/* Manager routes */}
        <Route 
          path="/manager/*" 
          element={
            <ManagerRoute user={user}>
              <ManagerLayout user={user} onLogout={handleLogout} />
            </ManagerRoute>
          } 
        />

        {/* Catch-all redirect */}
        <Route 
          path="*" 
          element={
            <Navigate to={user ? (user.role === 'MANAGER' ? '/manager' : '/member') : '/login'} replace />
          } 
        />
      </Routes>
    </Router>
  );
}
