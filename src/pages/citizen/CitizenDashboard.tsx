import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requestService, notificationService } from '../../services/api';
import { DocumentRequest, NotificationItem } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  FileText,
  Clock,
  CheckCircle2,
  Download,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  Eye,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [reqRes, notifRes] = await Promise.all([
          requestService.getMyRequests(),
          notificationService.getAll(),
        ]);
        if (reqRes.success && reqRes.data) {
          setRequests(reqRes.data);
        }
        if (notifRes.success && notifRes.data) {
          setNotifications(notifRes.data);
        }
      } catch (err) {
        console.error('Failed to load citizen dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const total = requests.length;
  const pending = requests.filter(
    (r) => !['APPROVED', 'READY_FOR_DOWNLOAD', 'COMPLETED', 'REJECTED', 'CANCELLED'].includes(r.status)
  ).length;
  const readyOrApproved = requests.filter(
    (r) => r.status === 'READY_FOR_DOWNLOAD' || r.status === 'APPROVED' || r.status === 'COMPLETED'
  ).length;
  const actionRequired = requests.filter(
    (r) => r.status === 'ADDITIONAL_DOCUMENT_REQUIRED'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-mono uppercase text-blue-300 tracking-wider">
              Citizen Self-Service Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Welcome back, {currentUser?.firstName} {currentUser?.lastName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Track active document verifications, view officer notes, or submit new statutory certificate requests online.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/citizen/apply"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Apply for New Document</span>
            </Link>
          </div>
        </div>

        {/* Action Required Banner if any */}
        {actionRequired > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">Officer Clarification Needed: </span>
                You have {actionRequired} application(s) awaiting supplementary document uploads.
              </div>
            </div>
            <Link
              to="/citizen/requests?status=ADDITIONAL_DOCUMENT_REQUIRED"
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-semibold whitespace-nowrap"
            >
              Upload Documents
            </Link>
          </div>
        )}

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Total Applications</span>
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {loading ? '-' : total}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Submitted in citizen portal</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Under Scrutiny / Pending</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {loading ? '-' : pending}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">In departmental verification</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Sanctioned / Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {loading ? '-' : readyOrApproved}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Approved digital certificates</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Recent Notifications</span>
              <Layers className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {loading ? '-' : notifications.filter((n) => !n.isRead).length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Unread status alerts</div>
          </div>
        </div>

        {/* Recent Applications Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs mb-8 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Document Requests
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Active applications undergoing verification and certificate generation
              </p>
            </div>
            <Link
              to="/citizen/requests"
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              <span>View All Applications</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Applications Submitted</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                You have not submitted any certificate requests yet. Get started by selecting a service from the catalog.
              </p>
              <Link
                to="/citizen/apply"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-semibold"
              >
                <PlusCircle className="w-4 h-4" />
                Apply for First Certificate
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Request No.</th>
                    <th className="py-3 px-4">Document Type</th>
                    <th className="py-3 px-4">Submitted Date</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4">Est. Delivery</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.slice(0, 5).map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-blue-700 whitespace-nowrap">
                        {req.requestNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {req.documentTypeDetails?.name || 'Government Certificate'}
                        <div className="text-[11px] text-slate-400">
                          {req.currentDepartment}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono whitespace-nowrap">
                        {new Date(req.submittedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={req.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono whitespace-nowrap">
                        {new Date(req.expectedCompletionDate).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                        <Link
                          to={`/citizen/requests/${req.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-semibold transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Details</span>
                        </Link>
                        {req.finalDocument && (
                          <a
                            href={requestService.getDownloadFinalCertUrl(req.id)}
                            download
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded font-semibold transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
