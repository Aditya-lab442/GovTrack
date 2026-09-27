import { db, INotification } from '../db/database';

export const notificationService = {
  createNotification: (
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'warning' | 'success' | 'alert' = 'info',
    requestId?: string
  ): INotification => {
    return db.notifications.create({
      user: userId,
      title,
      message,
      type,
      request: requestId,
      isRead: false,
    });
  },

  notifyStatusChange: (
    userId: string,
    requestNumber: string,
    newStatus: string,
    requestId: string,
    remarks?: string
  ) => {
    const statusTitles: Record<string, string> = {
      UNDER_REVIEW: 'Application Under Review',
      DOCUMENT_VERIFICATION: 'Document Verification Stage',
      ADDITIONAL_DOCUMENT_REQUIRED: 'Action Required: Additional Document Needed',
      PROCESSING: 'Application Processing in Department',
      APPROVED: 'Application Approved',
      REJECTED: 'Application Decision: Rejected',
      READY_FOR_DOWNLOAD: 'Official Certificate Issued',
      COMPLETED: 'Request Marked Completed',
      CANCELLED: 'Request Cancelled',
    };

    const title = statusTitles[newStatus] || `Status Updated: ${newStatus}`;
    let msg = `Your application ${requestNumber} status has transitioned to ${newStatus.replace(/_/g, ' ')}.`;
    if (remarks) {
      msg += ` Remarks: "${remarks}"`;
    }

    const type =
      newStatus === 'APPROVED' || newStatus === 'READY_FOR_DOWNLOAD'
        ? 'success'
        : newStatus === 'ADDITIONAL_DOCUMENT_REQUIRED' || newStatus === 'REJECTED'
        ? 'warning'
        : 'info';

    return notificationService.createNotification(userId, title, msg, type, requestId);
  },
};
