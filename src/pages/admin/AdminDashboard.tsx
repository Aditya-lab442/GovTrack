import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import { DashboardStats, RequestStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  FileSpreadsheet,
  Clock,
  FileCheck2,
  Cpu,
  CheckCircle2,
  XCircle,
  Download,
  Users,
  TrendingUp,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getDashboard();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Loading departmental analytics and queue counts...
      </div>
    );
  }

  const s = stats?.summary || {
    total: 0,
    pending: 0,
    submitted: 0,
    underReview: 0,
    docVerification: 0,
    additionalDocs: 0,
    processing: 0,
    approved: 0,
    readyForDownload: 0,
    completed: 0,
    rejected: 0,
    cancelled: 0,
    totalCitizens: 0,
    approvalRate: 0,
  };

  const statusChartData = [
    { name: 'Submitted', count: s.submitted, fill: '#3B82F6' },
    { name: 'Review', count: s.underReview, fill: '#6366F1' },
    { name: 'Verification', count: s.docVerification, fill: '#F59E0B' },
    { name: 'Action Req.', count: s.additionalDocs, fill: '#F97316' },
    { name: 'Processing', count: s.processing, fill: '#0EA5E9' },
    { name: 'Approved', count: s.approved, fill: '#10B981' },
    { name: 'Ready / Done', count: s.readyForDownload + s.completed, fill: '#059669' },
    { name: 'Rejected', count: s.rejected, fill: '#EF4444' },
  ];

  const docTypeData = stats?.byDocumentType || [];
  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Officer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Administrative Operations
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Department Scrutiny Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time intake monitoring, verification throughput, and sanction statistics.
          </p>
        </div>

        <Link
          to="/admin/requests"
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Layers className="w-4 h-4" />
          <span>Open Scrutiny Queue</span>
        </Link>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block mb-1">Total Intake</span>
          <div className="text-xl font-extrabold text-slate-900 font-mono tabular-nums">
            {s.total}
          </div>
          <span className="text-[10px] text-slate-400">All submissions</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-2xs">
          <span className="text-blue-700 font-semibold block mb-1">Active Queue</span>
          <div className="text-xl font-extrabold text-blue-900 font-mono tabular-nums">
            {s.pending}
          </div>
          <span className="text-[10px] text-blue-600">Pending scrutiny</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <span className="text-amber-800 font-semibold block mb-1">Doc Verification</span>
          <div className="text-xl font-extrabold text-amber-900 font-mono tabular-nums">
            {s.docVerification + s.additionalDocs}
          </div>
          <span className="text-[10px] text-amber-600">Under review / clarification</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <span className="text-emerald-800 font-semibold block mb-1">Sanctioned</span>
          <div className="text-xl font-extrabold text-emerald-900 font-mono tabular-nums">
            {s.approved + s.readyForDownload + s.completed}
          </div>
          <span className="text-[10px] text-emerald-600">Approved certificates</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-2xs">
          <span className="text-rose-800 font-semibold block mb-1">Rejected</span>
          <div className="text-xl font-extrabold text-rose-900 font-mono tabular-nums">
            {s.rejected}
          </div>
          <span className="text-[10px] text-rose-600">Ineligible / incomplete</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block mb-1">Approval Ratio</span>
          <div className="text-xl font-extrabold text-slate-900 font-mono tabular-nums">
            {s.approvalRate}%
          </div>
          <span className="text-[10px] text-slate-400">Statutory clearance</span>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications by Status Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Workflow Distribution by Processing Stage
              </h2>
              <p className="text-xs text-slate-500">Live file count across verification stages</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Stage Breakdown</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  cursor={{ fill: '#F1F5F9' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Requests by Document Type Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900">
              Applications by Service Type
            </h2>
            <p className="text-xs text-slate-500">Breakdown of requested certificate categories</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={docTypeData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {docTypeData.map((entry, index) => (
                    <Cell key={`dt-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2 max-h-28 overflow-y-auto pr-1">
            {docTypeData.map((dt, idx) => (
              <div key={dt.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="truncate text-slate-700">{dt.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900 ml-2">{dt.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Intake Trends */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Monthly Application Volume & Clearances
            </h2>
            <p className="text-xs text-slate-500">Historical trend across recent months</p>
          </div>
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
            Steady Throughput
          </span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.monthlyTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="applications" stroke="#2563EB" strokeWidth={2} name="Intake" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} name="Completed" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Queue: Recent Submissions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Latest Intake Applications
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Recent citizen submissions awaiting scrutiny officer action
            </p>
          </div>
          <Link
            to="/admin/requests"
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
          >
            <span>View Full Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Request No.</th>
                <th className="py-3 px-4">Citizen Name</th>
                <th className="py-3 px-4">Document Type</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentRequests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">
                    {r.requestNumber}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {r.citizenName}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {r.documentName}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={r.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono">
                    {new Date(r.submittedAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/admin/requests/${r.id}`}
                      className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-semibold transition-colors"
                    >
                      Process File
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
