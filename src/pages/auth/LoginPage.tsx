import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, User as UserIcon, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, loginAsDemoAdmin, loginAsDemoCitizen } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      // AuthProvider sets currentUser. If admin, route to /admin/dashboard, otherwise /citizen/dashboard
      if (email.toLowerCase().includes('admin')) {
        navigate('/admin/dashboard');
      } else {
        navigate(redirectPath || '/citizen/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCitizen = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginAsDemoCitizen();
      navigate(redirectPath || '/citizen/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdmin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginAsDemoAdmin();
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-black text-slate-900">
            <span className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              GT
            </span>
            <span>GovTrack Portal</span>
          </Link>
          <h2 className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Sign in to Civic Portal
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Access citizen document requests or administrative scrutiny console.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl">
          {/* Quick Demo Logins Box */}
          <div className="mb-6 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
              ⚡ Instant 1-Click Demo Login
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickCitizen}
                disabled={loading}
                className="p-2.5 bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-800 rounded-lg border border-slate-200 shadow-2xs font-medium transition-all text-left flex items-start gap-2"
              >
                <UserIcon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs">Citizen Account</div>
                  <div className="text-[10px] text-slate-500 font-mono">Rahul Patel</div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleQuickAdmin}
                disabled={loading}
                className="p-2.5 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 rounded-lg border border-slate-200 shadow-2xs font-medium transition-all text-left flex items-start gap-2"
              >
                <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs">Officer Desk</div>
                  <div className="text-[10px] text-slate-500 font-mono">Vikram Singhania</div>
                </div>
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs text-slate-500 uppercase">
              <span className="bg-white px-2">Or enter credentials</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? <span>Signing in...</span> : <span>Sign In to Account</span>}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            Don't have a registered citizen account?{' '}
            <Link to="/register" className="font-semibold text-blue-700 hover:text-blue-900">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
