import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FileCheck2,
  Users,
  ShieldAlert,
  UserCog,
  ChevronRight,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const navItems = [
    {
      to: '/admin/dashboard',
      label: 'Overview & Statistics',
      icon: LayoutDashboard,
    },
    {
      to: '/admin/requests',
      label: 'Applications Queue',
      icon: FileSpreadsheet,
    },
    {
      to: '/admin/document-types',
      label: 'Document Types',
      icon: FileCheck2,
    },
    {
      to: '/admin/users',
      label: 'Citizens & Officers',
      icon: Users,
    },
    {
      to: '/admin/audit-logs',
      label: 'Audit Trail Logs',
      icon: ShieldAlert,
    },
    {
      to: '/admin/profile',
      label: 'Officer Desk Profile',
      icon: UserCog,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Officer Desk Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block mb-0.5">
          Departmental Console
        </span>
        <div className="text-sm font-bold text-slate-900">
          Directorate of Public Services
        </div>
        <div className="text-xs text-slate-500">Scrutiny & Sanction Portal</div>
      </div>

      {/* Nav List */}
      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </NavLink>
          );
        })}
      </nav>

      {/* System Status Footnote */}
      <div className="p-4 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50/50">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-700">Audit Daemon Active</span>
        </div>
        <div>All state updates recorded with IP timestamps.</div>
      </div>
    </aside>
  );
};
