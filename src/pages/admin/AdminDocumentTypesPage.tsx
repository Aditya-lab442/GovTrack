import React, { useState, useEffect } from 'react';
import { documentTypeService } from '../../services/api';
import { DocumentType } from '../../types';
import {
  FileCheck2,
  PlusCircle,
  Clock,
  CreditCard,
  Building,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export const AdminDocumentTypesPage: React.FC = () => {
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Doc Form
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [processingTime, setProcessingTime] = useState(7);
  const [fee, setFee] = useState(50);
  const [reqDocInput, setReqDocInput] = useState('Aadhaar Card, Residential Address Proof, Passport Photo');

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const res = await documentTypeService.getAll();
      if (res.success && res.data) {
        setDocTypes(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      await documentTypeService.toggleStatus(id);
      fetchTypes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const reqDocs = reqDocInput.split(',').map((item) => ({
        name: item.trim(),
        description: `Verified copy of ${item.trim()}`,
        isRequired: true,
        allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png'],
        maxFileSize: 5,
      })).filter((d) => d.name);

      const res = await documentTypeService.create({
        name,
        department,
        description,
        processingTime: Number(processingTime),
        fee: Number(fee),
        requiredDocuments: reqDocs,
        dynamicFormFields: [
          { id: 'purposeOfCertificate', label: 'Purpose of Certificate', type: 'text', required: true, placeholder: 'e.g. Higher Education / Scholarship' },
        ],
      });

      if (res.success) {
        setShowModal(false);
        setName('');
        setDepartment('');
        setDescription('');
        fetchTypes();
      } else {
        setError(res.message || 'Failed to create document type');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Service Governance
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Statutory Document Types Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure certificate categories, required identity proofs, statutory turnaround SLAs, and processing fees.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Document Type</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading document configuration...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docTypes.map((dt) => (
            <div
              key={dt.id}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                dt.isActive ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-100 border-slate-300 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-blue-700 font-mono">{dt.department}</span>
                  <button
                    onClick={() => handleToggle(dt.id)}
                    className="flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                  >
                    {dt.isActive ? (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                        Active
                      </span>
                    ) : (
                      <span className="text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                        Deactivated
                      </span>
                    )}
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{dt.name}</h3>
                <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">{dt.description}</p>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block">SLA Turnaround</span>
                    <span className="font-semibold text-slate-800 font-mono">{dt.processingTime} Days</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Statutory Fee</span>
                    <span className="font-semibold text-slate-800 font-mono text-emerald-700">₹{dt.fee}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">
                    Required Proofs ({dt.requiredDocuments.length})
                  </span>
                  <ul className="space-y-1">
                    {dt.requiredDocuments.slice(0, 3).map((d, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5 truncate">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{d.name}</span>
                      </li>
                    ))}
                    {dt.requiredDocuments.length > 3 && (
                      <li className="text-[10px] text-slate-400 pl-4.5">
                        +{dt.requiredDocuments.length - 3} more items
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">ID: {dt.id}</span>
                <button
                  onClick={() => handleToggle(dt.id)}
                  className={`text-xs font-semibold cursor-pointer ${
                    dt.isActive ? 'text-rose-600 hover:text-rose-800' : 'text-emerald-700 hover:text-emerald-900'
                  }`}
                >
                  {dt.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Add New Statutory Certificate Type
            </h3>
            <p className="text-slate-500 mb-4">
              Enter statutory particulars and list required identification documents.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Senior Citizen Concession Certificate"
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Social Welfare & Pension Department"
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Official legal purpose and scope of certificate."
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Turnaround SLA (Days)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={processingTime}
                    onChange={(e) => setProcessingTime(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Statutory Fee (INR)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={fee}
                    onChange={(e) => setFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Required Documents (Comma separated)
                </label>
                <input
                  type="text"
                  value={reqDocInput}
                  onChange={(e) => setReqDocInput(e.target.value)}
                  placeholder="Aadhaar Card, Age Proof, Passport Photo"
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold"
                >
                  {saving ? 'Saving...' : 'Create Document Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
