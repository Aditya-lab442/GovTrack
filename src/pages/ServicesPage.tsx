import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { documentTypeService } from '../services/api';
import { DocumentType } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Clock,
  CheckCircle,
  FileCheck,
  Search,
  ArrowRight,
  Shield,
  CreditCard,
} from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await documentTypeService.getAll();
        if (res.success && res.data) {
          setDocTypes(res.data);
        }
      } catch (err) {
        console.error('Failed to load document types:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTypes();
  }, []);

  const departments = ['ALL', ...Array.from(new Set(docTypes.map((d) => d.department)))];

  const filtered = docTypes.filter((dt) => {
    const matchesDept = selectedDept === 'ALL' || dt.department === selectedDept;
    const matchesSearch =
      dt.name.toLowerCase().includes(search.toLowerCase()) ||
      dt.description.toLowerCase().includes(search.toLowerCase()) ||
      dt.department.toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesSearch && dt.isActive;
  });

  const handleApplyClick = (dtId: string) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/citizen/apply?type=${dtId}`);
    } else {
      navigate(`/citizen/apply?type=${dtId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Public Services Catalog
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-1 mb-2">
            Available Citizen Certificates & Documents
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
            Browse all officially designated certificates processed under the Public Services Guarantee Act. Review required identity proofs, processing turnaround times, and statutory fees prior to submission.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Department Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  selectedDept === dept
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {dept === 'ALL' ? 'All Departments' : dept}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search certificate by name..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Loading / Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white p-6 rounded-xl border border-slate-200 animate-pulse h-64" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Services Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your department filter or search keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((dt) => (
              <div
                key={dt.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between p-6"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-mono">
                    <span className="truncate max-w-[200px] text-blue-700 font-semibold">{dt.department}</span>
                    <span className="text-slate-400">ID: {dt.id}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {dt.name}
                  </h3>

                  <p className="text-xs text-slate-600 mb-4 leading-relaxed line-clamp-3">
                    {dt.description}
                  </p>

                  {/* Processing info */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs mb-4">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Processing Time</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        {dt.processingTime} Business Days
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Statutory Fee</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1 font-mono">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                        {dt.fee > 0 ? `₹${dt.fee}` : 'Free'}
                      </span>
                    </div>
                  </div>

                  {/* Required Documents Checklist */}
                  <div className="mb-4">
                    <span className="text-xs font-bold text-slate-800 block mb-2">
                      Required Attachments ({dt.requiredDocuments.length})
                    </span>
                    <ul className="space-y-1.5">
                      {dt.requiredDocuments.slice(0, 3).map((doc, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="truncate">{doc.name}</span>
                        </li>
                      ))}
                      {dt.requiredDocuments.length > 3 && (
                        <li className="text-[11px] text-slate-500 pl-5">
                          + {dt.requiredDocuments.length - 3} more supporting proof(s)
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleApplyClick(dt.id)}
                    className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Apply for {dt.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
