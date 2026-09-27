import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { documentTypeService, requestService } from '../../services/api';
import { DocumentType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Building,
} from 'lucide-react';

export const ApplyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedType = searchParams.get('type') || '';
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(preselectedType);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [step, setStep] = useState<number>(1); // 1: Select Type, 2: Fill Form, 3: Upload Docs, 4: Review & Declare, 5: Success
  const [dynamicAnswers, setDynamicAnswers] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [declarationChecked, setDeclarationChecked] = useState<boolean>(false);
  const [submittedResult, setSubmittedResult] = useState<{ requestNumber: string; id: string } | null>(null);

  useEffect(() => {
    const fetchDocTypes = async () => {
      try {
        const res = await documentTypeService.getAll();
        if (res.success && res.data) {
          setDocTypes(res.data.filter((d) => d.isActive));
          if (preselectedType && res.data.some((d) => d.id === preselectedType)) {
            setSelectedDocId(preselectedType);
            setStep(2);
          }
        }
      } catch (err) {
        console.error('Error loading document types:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocTypes();
  }, [preselectedType]);

  const selectedDoc = docTypes.find((d) => d.id === selectedDocId);

  const handleDynamicChange = (fieldId: string, value: any) => {
    setDynamicAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleFileChange = (docName: string, file: File | null) => {
    if (!file) return;

    // Validate size
    const reqSpec = selectedDoc?.requiredDocuments.find((d) => d.name === docName);
    const maxMB = reqSpec?.maxFileSize || 5;
    if (file.size > maxMB * 1024 * 1024) {
      alert(`File size exceeds maximum allowed ${maxMB} MB.`);
      return;
    }

    setUploadedFiles((prev) => ({ ...prev, [docName]: file }));
  };

  const handleNextFromForm = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required dynamic fields
    if (selectedDoc) {
      for (const field of selectedDoc.dynamicFormFields) {
        if (field.required && !dynamicAnswers[field.id]) {
          setError(`Please provide: ${field.label}`);
          return;
        }
      }
    }
    setStep(3);
  };

  const handleNextFromUploads = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedDoc) {
      for (const reqDoc of selectedDoc.requiredDocuments) {
        if (reqDoc.isRequired && !uploadedFiles[reqDoc.name]) {
          setError(`Mandatory attachment missing: "${reqDoc.name}". Please attach file to proceed.`);
          return;
        }
      }
    }
    setStep(4);
  };

  const handleFinalSubmit = async () => {
    if (!declarationChecked) {
      setError('Please check the statutory declaration checkbox to confirm accuracy.');
      return;
    }
    if (!selectedDoc) return;

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('documentTypeId', selectedDoc.id);
      formData.append('applicationDataRaw', JSON.stringify(dynamicAnswers));

      // Append files
      Object.entries(uploadedFiles).forEach(([docName, file]) => {
        formData.append(`doc_${encodeURIComponent(docName)}`, file);
      });

      const res = await requestService.create(formData);
      if (res.success && res.data) {
        setSubmittedResult({
          requestNumber: res.data.requestNumber,
          id: res.data.request.id,
        });
        setStep(5);
      } else {
        setError(res.message || 'Submission failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while transmitting application to department.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Step Indicator Header */}
        <div className="mb-8">
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Online Citizen Application
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {step === 5 ? 'Application Acknowledgement' : 'Apply for Official Document'}
          </h1>

          {/* Stepper Progress Bar */}
          {step < 5 && (
            <div className="flex items-center gap-2 mt-4 text-xs font-semibold">
              <span className={`px-2.5 py-1 rounded ${step >= 1 ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                1. Select Document
              </span>
              <span className="text-slate-300">/</span>
              <span className={`px-2.5 py-1 rounded ${step >= 2 ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                2. Details
              </span>
              <span className="text-slate-300">/</span>
              <span className={`px-2.5 py-1 rounded ${step >= 3 ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                3. Attach Proofs
              </span>
              <span className="text-slate-300">/</span>
              <span className={`px-2.5 py-1 rounded ${step >= 4 ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                4. Review & Confirm
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Please resolve the following:</div>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* STEP 1: Select Document Type */}
        {step === 1 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-2">
              Step 1: Choose Document / Certificate Category
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Select the specific statutory certificate required from the department.
            </p>

            {loading ? (
              <div className="text-xs text-slate-400 py-8 text-center">Loading services...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {docTypes.map((dt) => {
                  const isSelected = selectedDocId === dt.id;
                  return (
                    <div
                      key={dt.id}
                      onClick={() => setSelectedDocId(dt.id)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'border-blue-700 bg-blue-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-blue-700 font-semibold">{dt.department}</span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {dt.processingTime} Days
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1">{dt.name}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2">{dt.description}</p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                disabled={!selectedDocId}
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Application Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Fill Document-Specific Dynamic Details */}
        {step === 2 && selectedDoc && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <span className="text-xs text-blue-700 font-semibold">{selectedDoc.department}</span>
                <h2 className="text-lg font-bold text-slate-900">{selectedDoc.name} — Particulars</h2>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change Document
              </button>
            </div>

            <form onSubmit={handleNextFromForm} className="space-y-4">
              {/* Pre-filled applicant identity summary */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs mb-4">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Applicant Profile Identity
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Full Name:</span>
                    <span className="font-semibold">{currentUser?.firstName} {currentUser?.lastName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Mobile:</span>
                    <span className="font-mono">{currentUser?.mobileNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Jurisdiction / District:</span>
                    <span>{currentUser?.district}, {currentUser?.state}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic form fields for this certificate */}
              {selectedDoc.dynamicFormFields.map((field) => (
                <div key={field.id}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {field.label} {field.required && <span className="text-rose-600">*</span>}
                  </label>

                  {field.type === 'select' ? (
                    <select
                      required={field.required}
                      value={dynamicAnswers[field.id] || ''}
                      onChange={(e) => handleDynamicChange(field.id, e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Select Option --</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      required={field.required}
                      rows={3}
                      value={dynamicAnswers[field.id] || ''}
                      onChange={(e) => handleDynamicChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 bg-slate-50 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      type={field.type}
                      required={field.required}
                      value={dynamicAnswers[field.id] || ''}
                      onChange={(e) => handleDynamicChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 bg-slate-50 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Upload Documents</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: Required Documents Upload */}
        {step === 3 && selectedDoc && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Step 3: Upload Mandatory Proofs & Certificates
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Department rules require verified digital copies. Accepted formats: PDF, JPG, PNG (Max 5MB each).
            </p>

            <form onSubmit={handleNextFromUploads} className="space-y-5">
              {selectedDoc.requiredDocuments.map((reqDoc, idx) => {
                const attachedFile = uploadedFiles[reqDoc.name];
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{reqDoc.name}</span>
                        {reqDoc.isRequired && (
                          <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-semibold uppercase">
                            Mandatory
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{reqDoc.description}</p>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        Allowed: {reqDoc.allowedFileTypes.join(', ').toUpperCase()} · Limit: {reqDoc.maxFileSize}MB
                      </div>
                    </div>

                    <div>
                      {attachedFile ? (
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-2 rounded-lg border border-emerald-200 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="truncate max-w-[160px] font-medium">
                            {attachedFile.name}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const copy = { ...uploadedFiles };
                              delete copy[reqDoc.name];
                              setUploadedFiles(copy);
                            }}
                            className="text-rose-600 hover:text-rose-800 ml-2 font-bold cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span>Attach File</span>
                          <input
                            type="file"
                            accept={reqDoc.allowedFileTypes.map((t) => `.${t}`).join(',')}
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileChange(reqDoc.name, e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Review Application</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: Review Application & Declaration */}
        {step === 4 && selectedDoc && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900">
              Step 4: Final Scrutiny Review & Confirmation
            </h2>

            {/* Application Overview Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-700">Document Type</span>
                <span className="font-bold text-blue-800">{selectedDoc.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-700">Competent Department</span>
                <span className="text-slate-800">{selectedDoc.department}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-700">Estimated Turnaround</span>
                <span className="font-mono text-slate-800">{selectedDoc.processingTime} Business Days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">Statutory Fee</span>
                <span className="font-mono font-bold text-emerald-700">
                  {selectedDoc.fee > 0 ? `₹${selectedDoc.fee}` : 'Free of Charge'}
                </span>
              </div>
            </div>

            {/* Answers Table */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Declared Information Particulars
              </h3>
              <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
                {selectedDoc.dynamicFormFields.map((field) => (
                  <div key={field.id} className="py-2.5 px-3 flex justify-between">
                    <span className="text-slate-500">{field.label}:</span>
                    <span className="font-semibold text-slate-900">{dynamicAnswers[field.id] || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Uploaded Documents List */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Attached Digital Records ({Object.keys(uploadedFiles).length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(uploadedFiles).map(([docName, file], i) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <span className="font-medium text-slate-800 truncate">{docName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Declaration Checkbox */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={declarationChecked}
                  onChange={(e) => setDeclarationChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="leading-relaxed">
                  <strong>Statutory Declaration:</strong> I hereby declare that all particulars furnished above and attachments provided are true, correct, and complete to the best of my knowledge. I understand that submitting false or forged documentation is a penal offense under relevant executive statutes.
                </span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Back to Attachments
              </button>
              <button
                type="button"
                disabled={submitting || !declarationChecked}
                onClick={handleFinalSubmit}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
              >
                {submitting ? 'Transmitting to Department...' : 'Submit Application Now'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Success & Acknowledgement Receipt */}
        {step === 5 && submittedResult && (
          <div className="bg-white p-8 rounded-2xl border border-emerald-200 shadow-md text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              Application Submitted Successfully
            </h2>
            <p className="text-xs text-slate-600 mb-6">
              Your application has been received into the departmental intake queue under status <span className="font-semibold text-blue-700">SUBMITTED</span>.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 text-left">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Acknowledgement Application Number
              </span>
              <div className="text-xl font-extrabold text-blue-800 font-mono tracking-wide">
                {submittedResult.requestNumber}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Keep this acknowledgement reference for all inquiries and online tracking.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to={`/track-request?req=${submittedResult.requestNumber}`}
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
              >
                <span>Track Application Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={`/citizen/requests/${submittedResult.id}`}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
              >
                View Full Request Details
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
