import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/api';
import { NotificationItem } from '../../types';
import {
  Bell,
  User as UserIcon,
  LogOut,
  Shield,
  FileText,
  Search,
  PlusCircle,
  Menu,
  X,
  CheckCircle,
  Layers,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, isAuthenticated, isAdmin, logout, loginAsDemoAdmin, loginAsDemoCitizen } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationService.getAll();
      if (res.success && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [isAuthenticated, location.pathname]);

  const handleMarkAsRead = async (id: string, requestId?: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      if (requestId) {
        setNotificationsOpen(false);
        if (isAdmin) {
          navigate(`/admin/requests/${requestId}`);
        } else {
          navigate(`/citizen/requests/${requestId}`);
        }
      }
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      {/* Disclaimer Top Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-medium text-slate-200">
              Civic Document Scrutiny & Status Tracking System (GovTrack)
            </span>
            <span className="hidden md:inline text-slate-400">· Demo Prototype · Public Services Guarantee</span>
          </div>

          {/* Quick Demo Switcher */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="text-xs text-blue-300 hover:text-white flex items-center gap-1 font-mono transition-colors"
            >
              <span>Switch Demo Role</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {demoMenuOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs">
                <div className="px-3 py-1.5 border-b border-slate-700 text-slate-400 font-semibold">
                  1-Click Role Switcher
                </div>
                <button
                  onClick={async () => {
                    await loginAsDemoCitizen();
                    setDemoMenuOpen(false);
                    navigate('/citizen/dashboard');
                  }}
                  className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                >
                  <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                  <div>
                    <div className="font-medium">Citizen: Rahul Patel</div>
                    <div className="text-[10px] text-slate-400">Applicant Account</div>
                  </div>
                </button>
                <button
                  onClick={async () => {
                    await loginAsDemoAdmin();
                    setDemoMenuOpen(false);
                    navigate('/admin/dashboard');
                  }}
                  className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <div>
                    <div className="font-medium">Officer: Vikram Singhania</div>
                    <div className="text-[10px] text-slate-400">Tehsildar / Verification Desk</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Nav (Top Bar Contract: Zone 1, Zone 2, Zone 3) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 group">
            <span className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:bg-blue-800 transition-colors">
              GT
            </span>
            <span>GovTrack</span>
          </Link>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link
              to="/services"
              className={`hover:text-slate-900 transition-colors ${
                isActive('/services') ? 'text-blue-700 font-semibold' : ''
              }`}
            >
              Services Catalog
            </Link>
            <Link
              to="/track-request"
              className={`hover:text-slate-900 transition-colors ${
                isActive('/track-request') ? 'text-blue-700 font-semibold' : ''
              }`}
            >
              Track Application
            </Link>

            {isAuthenticated && !isAdmin && (
              <>
                <Link
                  to="/citizen/dashboard"
                  className={`hover:text-slate-900 transition-colors ${
                    isActive('/citizen/dashboard') ? 'text-blue-700 font-semibold' : ''
                  }`}
                >
                  Citizen Dashboard
                </Link>
                <Link
                  to="/citizen/requests"
                  className={`hover:text-slate-900 transition-colors ${
                    isActive('/citizen/requests') ? 'text-blue-700 font-semibold' : ''
                  }`}
                >
                  My Requests
                </Link>
                <Link
                  to="/citizen/apply"
                  className={`hover:text-slate-900 transition-colors ${
                    isActive('/citizen/apply') ? 'text-blue-700 font-semibold' : ''
                  }`}
                >
                  Apply New
                </Link>
              </>
            )}

            {isAuthenticated && isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`hover:text-slate-900 transition-colors ${
                    isActive('/admin/dashboard') ? 'text-blue-700 font-semibold' : ''
                  }`}
                >
                  Admin Overview
                </Link>
                <Link
                  to="/admin/requests"
                  className={`hover:text-slate-900 transition-colors ${
                    isActive('/admin/requests') ? 'text-blue-700 font-semibold' : ''
                  }`}
                >
                  Applications Queue
                </Link>
                <Link
                  to="/admin/document-types"
                  className={`hover:text-slate-900 transition-colors ${
                    isActive('/admin/document-types') ? 'text-blue-700 font-semibold' : ''
                  }`}
                >
                  Doc Config
                </Link>
              </>
            )}
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
                    aria-label="View notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <div className="font-semibold text-sm text-slate-800">
                          Notifications
                          {unreadCount > 0 && (
                            <span className="ml-2 text-xs font-normal text-slate-500">
                              ({unreadCount} unread)
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-sm text-slate-500">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleMarkAsRead(item.id, item.request)}
                              className={`p-3 text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                                !item.isRead ? 'bg-blue-50/50' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-semibold text-xs text-slate-800">
                                  {item.title}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                  {new Date(item.createdAt).toLocaleDateString([], {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                {item.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="px-4 py-2 border-t border-slate-100 text-center">
                        <Link
                          to={isAdmin ? '/admin/dashboard' : '/citizen/notifications'}
                          onClick={() => setNotificationsOpen(false)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View all updates
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    {currentUser?.profilePhoto ? (
                      <img
                        src={currentUser.profilePhoto}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover border border-slate-300"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                        {currentUser?.firstName[0]}
                        {currentUser?.lastName[0]}
                      </div>
                    )}
                    <span className="hidden sm:inline text-xs font-semibold text-slate-800">
                      {currentUser?.firstName}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {currentUser?.firstName} {currentUser?.lastName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-slate-100 text-slate-700">
                          {currentUser?.role}
                        </span>
                      </div>

                      {isAdmin ? (
                        <>
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <Shield className="w-4 h-4 text-slate-400" />
                            Officer Dashboard
                          </Link>
                          <Link
                            to="/admin/requests"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <Layers className="w-4 h-4 text-slate-400" />
                            Processing Queue
                          </Link>
                          <Link
                            to="/admin/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <UserIcon className="w-4 h-4 text-slate-400" />
                            Officer Profile
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/citizen/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <UserIcon className="w-4 h-4 text-slate-400" />
                            Citizen Dashboard
                          </Link>
                          <Link
                            to="/citizen/requests"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <FileText className="w-4 h-4 text-slate-400" />
                            My Applications
                          </Link>
                          <Link
                            to="/citizen/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <UserIcon className="w-4 h-4 text-slate-400" />
                            My Profile
                          </Link>
                        </>
                      )}

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await logout();
                          navigate('/login');
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
                >
                  Register Citizen
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Services Catalog
          </Link>
          <Link
            to="/track-request"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Track Application
          </Link>

          {isAuthenticated && !isAdmin && (
            <>
              <Link
                to="/citizen/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Citizen Dashboard
              </Link>
              <Link
                to="/citizen/requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                My Requests
              </Link>
              <Link
                to="/citizen/apply"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Apply for Document
              </Link>
            </>
          )}

          {isAuthenticated && isAdmin && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Admin Overview
              </Link>
              <Link
                to="/admin/requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Applications Queue
              </Link>
              <Link
                to="/admin/document-types"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Document Types
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
