import { RequestStatus } from '../db/database';

export const VALID_STATUS_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  SUBMITTED: ['UNDER_REVIEW', 'CANCELLED', 'REJECTED'],
  UNDER_REVIEW: ['DOCUMENT_VERIFICATION', 'REJECTED'],
  DOCUMENT_VERIFICATION: ['ADDITIONAL_DOCUMENT_REQUIRED', 'PROCESSING', 'REJECTED'],
  ADDITIONAL_DOCUMENT_REQUIRED: ['DOCUMENT_VERIFICATION', 'REJECTED'],
  PROCESSING: ['APPROVED', 'REJECTED'],
  APPROVED: ['READY_FOR_DOWNLOAD', 'REJECTED'],
  READY_FOR_DOWNLOAD: ['COMPLETED'],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
};

export function isValidTransition(
  currentStatus: RequestStatus,
  targetStatus: RequestStatus,
  userRole: 'citizen' | 'admin'
): { allowed: boolean; reason?: string } {
  // Citizen can only cancel if SUBMITTED
  if (userRole === 'citizen') {
    if (targetStatus === 'CANCELLED') {
      if (currentStatus === 'SUBMITTED') {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: `Citizens may only cancel requests while status is 'SUBMITTED'. Current status is '${currentStatus}'.`,
      };
    }
    return {
      allowed: false,
      reason: 'Citizens cannot directly update request processing statuses.',
    };
  }

  // Admin transitions
  if (currentStatus === targetStatus) {
    return { allowed: false, reason: `Request is already in '${currentStatus}' status.` };
  }

  const allowedNext = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(targetStatus)) {
    return {
      allowed: false,
      reason: `Invalid status transition from '${currentStatus}' to '${targetStatus}'. Allowed next stages: [${allowedNext.join(', ') || 'None (Terminal state)'}].`,
    };
  }

  return { allowed: true };
}
