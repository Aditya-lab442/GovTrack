import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { requestService } from '../../services/api';
import { DocumentRequest, RequestStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StatusTimeline } from '../../components/common/StatusTimeline';
import {
  FileText,
  Clock,
  Download,
  AlertCircle,
  Upload,
  Ban,
  ArrowLeft,
  Calendar,
  Building,
  UserCheck,
  CheckCircle2,
  FileCheck,
  Eye,
} from 'lucide-react';

export const CitizenRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<DocumentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Supplementary document upload state
  const [supplementaryFile, setSupplementaryFile] = useState<File | null>(null);
  const [supplementaryDocName, setSupplementaryDocName] = useState('');
  const [uploadingSupp, setUploadingSupp] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchRequestDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await requestService.getById(id);
      if (res.success && res.data) {
        setRequest(res.data);
      } else {
        setError(res.message || 'Request details could not be retrieved.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading request details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const handleSupplementaryUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplementaryFile || !id) return;

    setUploadingSupp(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('document', supplementaryFile);
      formData.append('documentTypeName', supplementaryDocName || 'Supplementary Document');

      const res = await requestService.uploadAdditional(id, formData);
      if (res.success) {
        setUploadSuccess(true);
        setSupplementaryFile(null);
        setSupplementaryDocName('');
        await fetchRequestDetails();
      } else {
        setError(res.message || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'Error uploading file.');
    } finally {
      setUploadingSupp(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!id) return;
    setCancelling(true);
    setError(null);
    try {
      const res = await requestService.cancel(id, cancelReason);
      if (res.success) {
        setShowCancelModal(false);
        await fetchRequestDetails();
      } else {
        setError(res.message || 'Cancellation failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Error cancelling request.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 text-center text-xs text-slate-500">
        Loading application details...
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 max-w-xl mx-auto">
        <div className="bg-white p-8 rounded-2xl border border-rose-200 text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Application Error</h2>
          <p className="text-xs text-slate-600 mt-1 mb-6">{error || 'Record not found'}</p>
          <Link
            to="/citizen/requests"
            className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-semibold"
          >
            Return to My Applications
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/citizen/requests"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Applications</span>
          </Link>

          <Link
            to={`/track-request?req=${request.requestNumber}`}
            className="text-xs font-mono text-blue-700 hover:text-blue-900 font-semibold"
          >
            Public Tracking Link ↗
          </Link>
        </div>

        {/* Header Summary Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-blue-700">
                  {request.requestNumber}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-medium">
                  {request.currentDepartment}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                {request.documentTypeDetails?.name || 'Government Certificate'}
              </h1>
            </div>

            <div className="flex flex-col items-start sm:items-end">
              <span className="text-xs text-slate-400 mb-1">Verification Status</span>
              <StatusBadge status={request.status} size="lg" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block mb-0.5">Submitted Date</span>
              <div className="font-semibold text-slate-800 flex items-center gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(request.submittedAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block mb-0.5">Estimated Completion</span>
              <div className="font-semibold text-slate-800 flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                {new Date(request.expectedCompletionDate).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block mb-0.5">Assigned Scrutiny Desk</span>
              <div className="font-semibold text-slate-800 truncate flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{request.assignedOfficer || 'Intake Desk'}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block mb-0.5">Statutory Fee</span>
              <div className="font-semibold text-slate-800 font-mono text-emerald-700">
                {request.documentTypeDetails?.fee ? `₹${request.documentTypeDetails.fee}` : 'Free'}
              </div>
            </div>
          </div>

          {/* Department Remarks Alert */}
          {request.remarks && (
            <div className="mt-4 p-3.5 bg-blue-50 border border-blue-200/80 rounded-lg text-xs text-blue-900">
              <span className="font-semibold">Department Note: </span>
              {request.remarks}
            </div>
          )}

          {/* Download Official Certificate Callout */}
          {request.finalDocument && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">
                    Official Certificate Sanctioned & Issued
                  </h3>
                  <p className="text-xs text-emerald-800 mt-0.5 font-mono">
                    Certificate No: {request.finalDocument.certificateNumber} · Issued {new Date(request.finalDocument.issuedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <a
                href={requestService.getDownloadFinalCertUrl(request.id)}
                download
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Authenticated PDF</span>
              </a>
            </div>
          )}
        </div>

        {/* Supplementary Document Request Action Box */}
        {request.status === 'ADDITIONAL_DOCUMENT_REQUIRED' && (
          <div className="bg-amber-50 border-2 border-amber-300 p-6 rounded-2xl shadow-sm mb-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-amber-950">
                  Action Required: Supplementary Document Requested
                </h3>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  The verification desk has requested clarification or supplementary documentation: <br />
                  <span className="font-semibold text-slate-900">"{request.remarks}"</span>
                </p>
              </div>
            </div>

            {uploadSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Supplementary document uploaded successfully. Application status has returned to Document Verification.
              </div>
            )}

            <form onSubmit={handleSupplementaryUpload} className="space-y-3 bg-white p-4 rounded-xl border border-amber-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Document Category / Name
                  </label>
                  <input
                    type="text"
                    required
                    value={supplementaryDocName}
                    onChange={(e) => setSupplementaryDocName(e.target.value)}
                    placeholder="e.g. Revised Income Affidavit / Parent Certificate"
                    className="w-full px-3 py-2 bg-slate-50 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select File (PDF, JPG, PNG)
                  </label>
                  <input
                    type="file"
                    required
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSupplementaryFile(e.target.files[0]);
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={uploadingSupp || !supplementaryFile}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploadingSupp ? 'Uploading...' : 'Submit Supplementary Document'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Particulars & Documents */}
          <div className="lg:col-span-2 space-y-6">
            {/* Particulars Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Application Form Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {Object.entries(request.applicationData || {}).map(([key, val]) => (
                  <div key={key} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[11px] capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {String(val) || 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Uploaded Documents Scrutiny List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Attached Identification & Eligibility Proofs
              </h3>

              <div className="space-y-3">
                {request.uploadedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
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
                      <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                        {doc.originalName} · {(doc.size / 1024).toFixed(0)} KB
                      </div>
                      {doc.verificationRemarks && (
                        <div className="text-[11px] text-slate-600 mt-1 italic">
                          "{doc.verificationRemarks}"
                        </div>
                      )}
                    </div>

                    <a
                      href={requestService.getDownloadDocUrl(request.id, doc.id)}
                      download
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Download File</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Cancel Application Option (Strictly SUBMITTED stage only) */}
            {request.status === 'SUBMITTED' && (
              <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">Need to withdraw application?</span>
                  <p className="text-slate-500 text-[11px]">
                    You may cancel your request while it is still in the initial intake queue.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="px-3 py-1.5 bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  Cancel Application
                </button>
              </div>
            )}
          </div>

          {/* Right Column (1 Col): Vertical Scrutiny Timeline */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Scrutiny Timeline & Audit History
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Official milestone progression
              </p>

              <StatusTimeline
                currentStatus={request.status}
                history={request.statusHistory}
              />
            </div>
          </div>
        </div>

        {/* Cancellation Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-rose-600 mb-3">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900">
                  Cancel Application {request.requestNumber}?
                </h3>
              </div>
              <p className="text-slate-600 mb-4 leading-relaxed">
                Are you sure you want to withdraw this application? Once cancelled, this application cannot be processed further and you must submit a new request if needed.
              </p>

              <div className="mb-4">
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Cancellation
                </label>
                <textarea
                  rows={2}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Applied by mistake / Obtained through another channel"
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Keep Active
                </button>
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={handleCancelRequest}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
