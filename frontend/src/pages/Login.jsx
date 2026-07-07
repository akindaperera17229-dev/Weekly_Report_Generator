import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.auth.login(email, password);
      onLoginSuccess(data);
      if (data.role === 'MANAGER') {
        navigate('/manager');
      } else {
        navigate('/member');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-200 relative overflow-hidden">
      
      {/* Abstract Background Patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 dark:opacity-20 pointer-events-none z-0"></div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-8 shadow-xl transition-all duration-300 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex mb-3">
            <svg className="w-12 h-12 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="9" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/>
              <rect x="14" y="3" width="7" height="5" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/>
              <rect x="3" y="16" width="7" height="5" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/>
              <rect x="14" y="12" width="7" height="9" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/>
              <path d="M7 10L10 7L13 10L17 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"/>
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight font-display">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Sign in to manage your reports and team dashboard
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 rounded-xl text-xs flex items-start gap-2">
            <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
              <Mail className="absolute left-4 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-slate-800 dark:text-slate-100 outline-none placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
              <Lock className="absolute left-4 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 bg-transparent text-sm text-slate-800 dark:text-slate-100 outline-none placeholder-slate-400 dark:placeholder-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/15 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-70 disabled:hover:scale-100 disabled:active:scale-100"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-850 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
