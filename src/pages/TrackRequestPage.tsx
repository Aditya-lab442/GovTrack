import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { requestService } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { StatusTimeline } from '../components/common/StatusTimeline';
import { RequestStatus } from '../types';
import {
  Search,
  FileCheck2,
  Calendar,
  Building,
  UserCheck,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
  Shield,
} from 'lucide-react';

export const TrackRequestPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialReq = searchParams.get('req') || '';

  const [inputNumber, setInputNumber] = useState(initialReq);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackData, setTrackData] = useState<any | null>(null);

  const fetchTracking = async (reqNo: string) => {
    if (!reqNo.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await requestService.trackByNumber(reqNo.trim());
      if (res.success && res.data) {
        setTrackData(res.data);
      } else {
        setError(res.message || 'No application record found.');
        setTrackData(null);
      }
    } catch (err: any) {
      setError(err.message || 'Application not found. Please verify the request number.');
      setTrackData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialReq) {
      fetchTracking(initialReq);
    }
  }, [initialReq]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputNumber.trim()) {
      setSearchParams({ req: inputNumber.trim().toUpperCase() });
      fetchTracking(inputNumber.trim().toUpperCase());
    }
  };

  const sampleNumbers = [
    { num: 'GOV-2026-000001', label: 'Income Cert (Ready for Download)' },
    { num: 'GOV-2026-000002', label: 'Caste Cert (In Verification)' },
    { num: 'GOV-2026-000003', label: 'Domicile (Submitted Stage)' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Public Inquiry Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 mb-2">
            Track Citizen Application Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Input the 16-character acknowledgement number from your submission receipt to inspect scrutiny logs and estimated delivery dates.
          </p>
        </div>

        {/* Tracker Search Box */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={inputNumber}
                onChange={(e) => setInputNumber(e.target.value)}
                placeholder="Enter Application No. (e.g. GOV-2026-000001)"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 text-slate-900 text-sm font-mono uppercase font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Querying...</span>
              ) : (
                <>
                  <span>Track Application</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fills */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Quick sample queries:</span>
            {sampleNumbers.map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  setInputNumber(s.num);
                  setSearchParams({ req: s.num });
                  fetchTracking(s.num);
                }}
                className="font-mono bg-slate-100 hover:bg-blue-50 hover:text-blue-700 px-2.5 py-1 rounded text-slate-700 transition-colors cursor-pointer border border-slate-200"
              >
                {s.num}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-3 mb-8">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Application Record Not Located</div>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Tracking Details View */}
        {trackData && (
          <div className="space-y-6">
            {/* Status Summary Banner */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
                <div>
                  <span className="text-xs font-medium text-slate-500">Document Requested</span>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                    {trackData.documentType}
                  </h2>
                  <div className="text-xs font-mono text-blue-700 mt-1">
                    Application ID: {trackData.requestNumber}
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end">
                  <span className="text-xs text-slate-500 mb-1">Current Scrutiny Stage</span>
                  <StatusBadge status={trackData.status as RequestStatus} size="lg" />
                </div>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block mb-1">Submitted Date</span>
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(trackData.submittedAt).toLocaleDateString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block mb-1">Estimated Completion</span>
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    {new Date(trackData.expectedCompletionDate).toLocaleDateString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block mb-1">Concerned Department</span>
                  <div className="font-semibold text-slate-800 truncate flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{trackData.department}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block mb-1">Scrutiny Desk / Officer</span>
                  <div className="font-semibold text-slate-800 truncate flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{trackData.assignedOfficer || 'Intake Queue'}</span>
                  </div>
                </div>
              </div>

              {trackData.remarks && (
                <div className="mt-4 p-3 bg-blue-50/70 border border-blue-200/80 rounded-lg text-xs text-blue-900">
                  <span className="font-semibold">Departmental Note: </span>
                  {trackData.remarks}
                </div>
              )}
            </div>

            {/* Vertical Milestones Timeline */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Application Scrutiny Timeline
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Full verification audit trail with statutory timestamps
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified History</span>
                </div>
              </div>

              <StatusTimeline
                currentStatus={trackData.status as RequestStatus}
                history={trackData.timeline?.map((t: any) => ({
                  newStatus: t.stage,
                  timestamp: t.timestamp,
                  remarks: t.remarks,
                  changedByRole: t.role,
                }))}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
