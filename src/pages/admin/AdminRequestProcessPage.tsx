import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { adminService, requestService } from '../../services/api';
import { DocumentRequest, RequestStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StatusTimeline } from '../../components/common/StatusTimeline';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Download,
  Upload,
  ArrowLeft,
  Shield,
  Layers,
  FileCheck2,
  Calendar,
  Building,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

export const AdminRequestProcessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [request, setRequest] = useState<DocumentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Status Update state
  const [targetStatus, setTargetStatus] = useState<RequestStatus | ''>('');
  const [remarks, setRemarks] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Document verification modal/state
  const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null);
  const [verificationRemarks, setVerificationRemarks] = useState('');

  // Additional doc request state
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [additionalDocName, setAdditionalDocName] = useState('');
  const [additionalDocRemarks, setAdditionalDocRemarks] = useState('');
  const [requestingDoc, setRequestingDoc] = useState(false);

  // Final document issuance state
  const [showFinalDocModal, setShowFinalDocModal] = useState(false);
  const [finalDocFile, setFinalDocFile] = useState<File | null>(null);
  const [certNumber, setCertNumber] = useState('');
  const [issuingCert, setIssuingCert] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await adminService.getRequestDetails(id);
      if (res.success && res.data) {
        setRequest(res.data);
        setAssignedOfficer(res.data.assignedOfficer || `${currentUser?.firstName} ${currentUser?.lastName}`);
      } else {
        setError(res.message || 'Failed to load request particulars.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading request.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // Allowed transitions map
  const allowedNextStatuses: Record<RequestStatus, { value: RequestStatus; label: string }[]> = {
    SUBMITTED: [
      { value: 'UNDER_REVIEW', label: 'Under Review' },
      { value: 'REJECTED', label: 'Reject Application' },
    ],
    UNDER_REVIEW: [
      { value: 'DOCUMENT_VERIFICATION', label: 'Document Verification' },
      { value: 'REJECTED', label: 'Reject Application' },
    ],
    DOCUMENT_VERIFICATION: [
      { value: 'ADDITIONAL_DOCUMENT_REQUIRED', label: 'Additional Document Required' },
      { value: 'PROCESSING', label: 'Administrative Processing' },
      { value: 'REJECTED', label: 'Reject Application' },
    ],
    ADDITIONAL_DOCUMENT_REQUIRED: [
      { value: 'DOCUMENT_VERIFICATION', label: 'Return to Document Verification' },
      { value: 'REJECTED', label: 'Reject Application' },
    ],
    PROCESSING: [
      { value: 'APPROVED', label: 'Approve Application' },
      { value: 'REJECTED', label: 'Reject Application' },
    ],
    APPROVED: [
      { value: 'READY_FOR_DOWNLOAD', label: 'Ready for Download (Issue Cert)' },
      { value: 'REJECTED', label: 'Reject / Revoke Application' },
    ],
    READY_FOR_DOWNLOAD: [
      { value: 'COMPLETED', label: 'Mark Completed' },
    ],
    COMPLETED: [],
    REJECTED: [],
    CANCELLED: [],
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !targetStatus) return;

    if (targetStatus === 'REJECTED' && !remarks.trim()) {
      setError('A rejection reason is mandatory when rejecting an application.');
      return;
    }

    setUpdatingStatus(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await adminService.updateStatus(id, {
        status: targetStatus,
        remarks: remarks.trim() || undefined,
        assignedOfficer: assignedOfficer.trim() || undefined,
      });

      if (res.success) {
        setSuccessMsg(`Status successfully transitioned to ${targetStatus}`);
        setRemarks('');
        setTargetStatus('');
        await fetchDetails();
      } else {
        setError(res.message || 'Status transition denied by workflow engine.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred updating status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleVerifyDoc = async (documentId: string, status: 'VERIFIED' | 'REJECTED', docRemarks?: string) => {
    if (!id) return;
    setError(null);
    try {
      const res = await adminService.verifyDocument(id, documentId, {
        verificationStatus: status,
        remarks: docRemarks,
      });
      if (res.success) {
        setSuccessMsg(`Document marked as ${status}`);
        setVerifyingDocId(null);
        setVerificationRemarks('');
        await fetchDetails();
      } else {
        setError(res.message || 'Document verification failed.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRequestAdditionalDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !additionalDocRemarks) return;

    setRequestingDoc(true);
    setError(null);
    try {
      const res = await adminService.requestAdditionalDoc(id, {
        documentName: additionalDocName || 'Supplementary Proof Document',
        remarks: additionalDocRemarks,
      });
      if (res.success) {
        setSuccessMsg('Clarification request issued to citizen.');
        setShowAddDocModal(false);
        setAdditionalDocName('');
        setAdditionalDocRemarks('');
        await fetchDetails();
      } else {
        setError(res.message || 'Requesting additional document failed.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRequestingDoc(false);
    }
  };

  const handleFinalDocIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIssuingCert(true);
    setError(null);
    try {
      const formData = new FormData();
      if (finalDocFile) {
        formData.append('certificate', finalDocFile);
      }
      if (certNumber) {
        formData.append('certificateNumber', certNumber);
      }

      const res = await adminService.uploadFinalDocument(id, formData);
      if (res.success) {
        setSuccessMsg('Official digital certificate uploaded and issued to citizen.');
        setShowFinalDocModal(false);
        setFinalDocFile(null);
        setCertNumber('');
        await fetchDetails();
      } else {
        setError(res.message || 'Issuing certificate failed.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIssuingCert(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading application particulars...</div>;
  }

  if (error && !request) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-rose-200">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-2" />
        <h2 className="text-sm font-bold text-slate-900">Application Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">{error}</p>
        <Link to="/admin/requests" className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-semibold">
          Return to Queue
        </Link>
      </div>
    );
  }

  const nextOptions = request ? allowedNextStatuses[request.status] || [] : [];
  const citizen = request?.citizenDetails;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/requests"
            className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-blue-700 text-base">
                {request?.requestNumber}
              </span>
              <StatusBadge status={request!.status} size="sm" />
            </div>
            <p className="text-xs text-slate-500">
              {request?.documentTypeDetails?.name} · {request?.currentDepartment}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {request?.status === 'DOCUMENT_VERIFICATION' && (
            <button
              onClick={() => setShowAddDocModal(true)}
              className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Request Clarification / Doc</span>
            </button>
          )}

          {request?.status === 'APPROVED' && (
            <button
              onClick={() => {
                setCertNumber(`CERT/${new Date().getFullYear()}/${Math.floor(100000 + Math.random() * 900000)}`);
                setShowFinalDocModal(true);
              }}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Issue Digital Certificate</span>
            </button>
          )}
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2-Column Console Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Citizen Identity, Application Data, Attached Documents Scrutiny */}
        <div className="lg:col-span-2 space-y-6">
          {/* Citizen Identity Profile */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-700" />
              <span>Citizen Applicant Profile</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Full Name</span>
                <span className="font-semibold text-slate-900">
                  {citizen?.firstName} {citizen?.lastName}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Email Address</span>
                <span className="font-semibold text-slate-900 font-mono">{citizen?.email}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Mobile Number</span>
                <span className="font-semibold text-slate-900 font-mono">{citizen?.mobileNumber}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 sm:col-span-2">
                <span className="text-[10px] text-slate-400 block">Residential Address</span>
                <span className="text-slate-800">{citizen?.address || 'Not specified'}</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">District / State</span>
                <span className="text-slate-800">
                  {citizen?.district}, {citizen?.state} ({citizen?.pincode})
                </span>
              </div>
            </div>
          </div>

          {/* Declared Application Data */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-700" />
              <span>Declared Application Data Particulars</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(request?.applicationData || {}).map(([key, val]) => (
                <div key={key} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="font-semibold text-slate-900 text-xs">
                    {String(val) || 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Uploaded Documents Scrutiny Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-blue-700" />
                  <span>Document Attachments Verification</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Officer must cross-verify each uploaded proof prior to status clearance
                </p>
              </div>
              <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                {request?.uploadedDocuments.filter((d) => d.verificationStatus === 'VERIFIED').length} / {request?.uploadedDocuments.length} Verified
              </span>
            </div>

            <div className="space-y-3">
              {request?.uploadedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900">{doc.documentType}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          doc.verificationStatus === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.verificationStatus === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {doc.verificationStatus === 'VERIFIED'
                          ? '✓ Verified'
                          : doc.verificationStatus === 'REJECTED'
                          ? '✕ Rejected'
                          : '● Pending Scrutiny'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono">
                      File: {doc.originalName} · {(doc.size / 1024).toFixed(0)} KB · Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                    </div>

                    {doc.verificationRemarks && (
                      <div className="text-[11px] text-slate-600 mt-1 italic">
                        Note: "{doc.verificationRemarks}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <a
                      href={requestService.getDownloadDocUrl(request.id, doc.id)}
                      download
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1"
                    >
                      <Download className="w-3 h-3 text-slate-400" />
                      <span>View File</span>
                    </a>

                    {doc.verificationStatus !== 'VERIFIED' && (
                      <button
                        onClick={() => handleVerifyDoc(doc.id, 'VERIFIED')}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verify</span>
                      </button>
                    )}

                    {doc.verificationStatus !== 'REJECTED' && (
                      <button
                        onClick={() => {
                          const reason = prompt('Enter reason for document rejection:');
                          if (reason) {
                            handleVerifyDoc(doc.id, 'REJECTED', reason);
                          }
                        }}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Status Workflow Action Box & Status History */}
        <div className="space-y-6">
          {/* Update Status Form Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-700" />
              <span>Update Request Status</span>
            </h2>

            <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Current Stage
                </label>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono font-bold text-slate-800">
                  {request?.status}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Permitted Next Transition
                </label>
                {nextOptions.length === 0 ? (
                  <div className="p-3 bg-slate-100 rounded-lg text-slate-500 font-mono">
                    Terminal State (No further transitions allowed)
                  </div>
                ) : (
                  <select
                    required
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value as RequestStatus)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select New Status --</option>
                    {nextOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} ({opt.value})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Officer / Desk
                </label>
                <input
                  type="text"
                  value={assignedOfficer}
                  onChange={(e) => setAssignedOfficer(e.target.value)}
                  placeholder="e.g. Vikram Singhania (Verification Desk)"
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Department Remarks {targetStatus === 'REJECTED' && <span className="text-rose-600">* (Mandatory for rejection)</span>}
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter administrative observation or decision decree notes..."
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={updatingStatus || !targetStatus}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {updatingStatus ? 'Updating Status...' : 'Apply Status Transition'}
              </button>
            </form>
          </div>

          {/* Audit History Timeline */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-700" />
              <span>Full Status History Ledger</span>
            </h2>

            <StatusTimeline
              currentStatus={request!.status}
              history={request!.statusHistory}
            />
          </div>
        </div>
      </div>

      {/* Additional Document Modal */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Request Additional Document
            </h3>
            <p className="text-slate-500 mb-4">
              This will transition the application status to <strong>ADDITIONAL_DOCUMENT_REQUIRED</strong> and notify the citizen.
            </p>

            <form onSubmit={handleRequestAdditionalDoc} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Document Proof Name
                </label>
                <input
                  type="text"
                  required
                  value={additionalDocName}
                  onChange={(e) => setAdditionalDocName(e.target.value)}
                  placeholder="e.g. Attested Parent School Leaving Certificate"
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Instructions / Clarification Note *
                </label>
                <textarea
                  required
                  rows={3}
                  value={additionalDocRemarks}
                  onChange={(e) => setAdditionalDocRemarks(e.target.value)}
                  placeholder="Explain why this proof is required and how the citizen should obtain/upload it."
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestingDoc}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold"
                >
                  {requestingDoc ? 'Submitting...' : 'Issue Clarification Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Final Certificate Issue Modal */}
      {showFinalDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Issue Official Digital Certificate
            </h3>
            <p className="text-slate-500 mb-4">
              Upload the signed certificate PDF (or leave blank to auto-generate verified certificate) and assign official register serial number.
            </p>

            <form onSubmit={handleFinalDocIssue} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Certificate Serial Number *
                </label>
                <input
                  type="text"
                  required
                  value={certNumber}
                  onChange={(e) => setCertNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 font-mono font-bold text-blue-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Upload Signed Certificate File (PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFinalDocFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Optional: If omitted, system attaches standard cryptographic prototype certificate template.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFinalDocModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={issuingCert}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
                >
                  {issuingCert ? 'Issuing Certificate...' : 'Sanction & Issue Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
