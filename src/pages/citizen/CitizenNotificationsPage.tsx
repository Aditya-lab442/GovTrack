import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../../services/api';
import { NotificationItem } from '../../types';
import { Bell, CheckCheck, Clock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const CitizenNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await notificationService.getAll();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAll = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleMarkOne = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Status Alerts
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Application Notifications
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live updates triggered whenever an officer changes status or issues remarks.
            </p>
          </div>

          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAll}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-blue-600" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Notifications</h3>
            <p className="text-xs text-slate-500 mt-1">
              You will receive automated updates here when your applications are updated.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleMarkOne(notif.id)}
                className={`p-4 rounded-xl border transition-all text-xs flex items-start justify-between gap-4 ${
                  !notif.isRead
                    ? 'bg-blue-50/40 border-blue-200 shadow-2xs'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.type === 'success'
                        ? 'bg-emerald-100 text-emerald-700'
                        : notif.type === 'warning'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {notif.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{notif.title}</span>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <p className="text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                    <div className="text-[10px] text-slate-400 font-mono mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(notif.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {notif.request && (
                  <Link
                    to={`/citizen/requests/${notif.request}`}
                    className="shrink-0 px-3 py-1.5 bg-white hover:bg-slate-100 text-blue-700 border border-slate-200 rounded-lg font-semibold flex items-center gap-1"
                  >
                    <span>View Application</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
