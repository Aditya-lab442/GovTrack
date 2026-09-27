import React from 'react';
import { RequestStatus, StatusHistory } from '../../types';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Download,
  XCircle,
  Ban,
} from 'lucide-react';

interface StatusTimelineProps {
  currentStatus: RequestStatus;
  history?: StatusHistory[];
  compact?: boolean;
}

const ORDERED_STEPS: { status: RequestStatus; title: string; description: string }[] = [
  { status: 'SUBMITTED', title: 'Application Submitted', description: 'Application logged with digital acknowledgement receipt.' },
  { status: 'UNDER_REVIEW', title: 'Under Initial Review', description: 'Assigned to scrutiny officer in the department desk.' },
  { status: 'DOCUMENT_VERIFICATION', title: 'Document Verification', description: 'Certificates and identity proofs undergoing cross-verification.' },
  { status: 'PROCESSING', title: 'Administrative Processing', description: 'Assessment by competent sanctioning authority.' },
  { status: 'APPROVED', title: 'Decision & Sanction', description: 'Application approved for digital certificate issuance.' },
  { status: 'READY_FOR_DOWNLOAD', title: 'Certificate Issued', description: 'Digitally signed official document ready for citizen download.' },
  { status: 'COMPLETED', title: 'Request Completed', description: 'Citizen received and downloaded authenticated certificate.' },
];

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  currentStatus,
  history = [],
  compact = false,
}) => {
  // If rejected or cancelled, treat specially
  const isTerminalNegative = currentStatus === 'REJECTED' || currentStatus === 'CANCELLED';

  // Map histories by status for easy lookup of latest entry for that status
  const historyMap = new Map<string, StatusHistory>();
  history.forEach((h) => {
    historyMap.set(h.newStatus, h);
  });

  const getStepIndex = (s: RequestStatus) => {
    return ORDERED_STEPS.findIndex((step) => step.status === s);
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="space-y-6">
      <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200">
        {ORDERED_STEPS.map((step, idx) => {
          const stepHistory = historyMap.get(step.status);
          const isPassed = currentIndex > idx || (currentIndex === -1 && false);
          const isCurrent = currentStatus === step.status;
          const isPending = currentIndex < idx;

          let iconBg = 'bg-slate-100 text-slate-400 border-slate-300';
          let titleColor = 'text-slate-500';

          if (isPassed) {
            iconBg = 'bg-emerald-600 text-white border-emerald-600';
            titleColor = 'text-slate-900 font-semibold';
          } else if (isCurrent) {
            iconBg = 'bg-blue-600 text-white border-blue-600 shadow-md ring-4 ring-blue-100';
            titleColor = 'text-blue-900 font-bold';
          }

          return (
            <div key={step.status} className="mb-8 relative last:mb-0 group">
              {/* Timeline marker */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-0.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-colors ${iconBg}`}
              >
                {isPassed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                )}
              </div>

              {/* Step info */}
              <div className="bg-white p-4 rounded-lg border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <h4 className={`text-sm sm:text-base ${titleColor}`}>
                    {step.title}
                  </h4>
                  {stepHistory && (
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(stepHistory.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mb-2">
                  {step.description}
                </p>

                {/* Specific remarks from history if present */}
                {stepHistory?.remarks && (
                  <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded-md border border-slate-200/60 text-slate-700">
                    <span className="font-semibold text-slate-800">Officer Note: </span>
                    {stepHistory.remarks}
                  </div>
                )}

                {isCurrent && !stepHistory?.remarks && (
                  <div className="mt-2 text-xs text-blue-700 bg-blue-50/70 px-2.5 py-1.5 rounded border border-blue-200/60 font-medium inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    Currently in progress at department desk.
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Special handling if ADDITIONAL_DOCUMENT_REQUIRED */}
        {currentStatus === 'ADDITIONAL_DOCUMENT_REQUIRED' && (
          <div className="mb-8 relative">
            <div className="absolute -left-[31px] sm:-left-[39px] top-0.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500 text-white border-2 border-amber-600 flex items-center justify-center ring-4 ring-amber-100">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="bg-amber-50/80 p-4 rounded-lg border border-amber-300 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-amber-900">
                  Supplementary Document Required
                </h4>
                {historyMap.get('ADDITIONAL_DOCUMENT_REQUIRED') && (
                  <span className="text-xs text-amber-700 font-mono">
                    {new Date(
                      historyMap.get('ADDITIONAL_DOCUMENT_REQUIRED')!.timestamp
                    ).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-800">
                The verification officer has requested clarification or supplementary documents.
              </p>
              {historyMap.get('ADDITIONAL_DOCUMENT_REQUIRED')?.remarks && (
                <div className="mt-2 text-xs bg-white p-2.5 rounded border border-amber-200 text-slate-800">
                  <span className="font-semibold">Requirement: </span>
                  {historyMap.get('ADDITIONAL_DOCUMENT_REQUIRED')!.remarks}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Terminal Negative Handling (REJECTED or CANCELLED) */}
        {isTerminalNegative && (
          <div className="relative">
            <div
              className={`absolute -left-[31px] sm:-left-[39px] top-0.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full text-white border-2 flex items-center justify-center ring-4 ${
                currentStatus === 'REJECTED'
                  ? 'bg-rose-600 border-rose-700 ring-rose-100'
                  : 'bg-slate-600 border-slate-700 ring-slate-100'
              }`}
            >
              {currentStatus === 'REJECTED' ? <XCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
            </div>
            <div
              className={`p-4 rounded-lg border shadow-xs ${
                currentStatus === 'REJECTED'
                  ? 'bg-rose-50 border-rose-200'
                  : 'bg-slate-100 border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h4
                  className={`text-sm font-bold ${
                    currentStatus === 'REJECTED' ? 'text-rose-900' : 'text-slate-800'
                  }`}
                >
                  {currentStatus === 'REJECTED' ? 'Application Rejected' : 'Application Cancelled'}
                </h4>
                {historyMap.get(currentStatus) && (
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(historyMap.get(currentStatus)!.timestamp).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700">
                {currentStatus === 'REJECTED'
                  ? 'The application could not be sanctioned by the department authority.'
                  : 'The application was cancelled by applicant request.'}
              </p>
              {historyMap.get(currentStatus)?.remarks && (
                <div className="mt-2 text-xs bg-white p-2.5 rounded border border-rose-200 text-slate-900">
                  <span className="font-semibold">Reason: </span>
                  {historyMap.get(currentStatus)!.remarks}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
