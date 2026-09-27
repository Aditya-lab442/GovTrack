import { Response } from 'express';
import { db } from '../db/database';
import { AuthRequest } from '../middleware/auth';

export const notificationController = {
  getNotifications: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const notifs = db.notifications.findByUser(req.user.id);
      const unreadCount = notifs.filter((n) => !n.isRead).length;

      return res.json({
        success: true,
        data: notifs,
        unreadCount,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  markAsRead: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const success = db.notifications.markAsRead(id);
      return res.json({
        success,
        message: success ? 'Notification marked as read' : 'Notification not found',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  markAllAsRead: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const count = db.notifications.markAllAsRead(req.user.id);
      return res.json({
        success: true,
        message: `${count} notifications marked as read`,
        count,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },
};
