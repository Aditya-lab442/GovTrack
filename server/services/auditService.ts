import { db, IAuditLog } from '../db/database';

export const auditService = {
  log: (
    userId: string,
    action: string,
    description: string,
    ipAddress: string = '127.0.0.1',
    requestId?: string
  ): IAuditLog => {
    return db.auditLogs.create({
      user: userId,
      action,
      description,
      ipAddress,
      request: requestId,
    });
  },
};
