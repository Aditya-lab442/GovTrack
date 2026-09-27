import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, User, Building, MapPin, Mail, Phone, Calendar } from 'lucide-react';

export const AdminProfilePage: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
          Administrative Credentials
        </span>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          Scrutiny Officer Desk Profile
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Designated verification authority profile and audit accreditation.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 border-b border-slate-100 pb-6 mb-6">
          {currentUser?.profilePhoto ? (
            <img
              src={currentUser.profilePhoto}
              alt="Officer Headshot"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-600 shadow-sm"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-blue-700 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
              {currentUser?.firstName[0]}
              {currentUser?.lastName[0]}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-900">
                {currentUser?.firstName} {currentUser?.lastName}
              </h2>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold uppercase rounded font-mono">
                Gazetted Officer
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Deputy Tehsildar & Verification Desk Authority
            </p>
            <div className="text-[11px] text-blue-700 font-mono mt-1">
              GovTrack Official Officer ID: {currentUser?.id}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-1">Official Email Address</span>
            <div className="font-semibold text-slate-900 font-mono flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{currentUser?.email}</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-1">Authorized Contact Desk</span>
            <div className="font-semibold text-slate-900 font-mono flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{currentUser?.mobileNumber}</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-1">Jurisdiction Center</span>
            <div className="font-semibold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400" />
              <span>Directorate of Citizen Services, Civil Lines</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-1">District / Territory</span>
            <div className="font-semibold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{currentUser?.district}, {currentUser?.state}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Digital Certificate Signing Key Active</span>
          </div>
          <span className="font-mono">Audit Authority Verified</span>
        </div>
      </div>
    </div>
  );
};
