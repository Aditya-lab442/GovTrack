import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { db, IUser } from '../db/database';

export interface AuthRequest extends Request {
  user?: Omit<IUser, 'password'>;
}

export function generateToken(user: IUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token missing or invalid format.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; role: 'citizen' | 'admin' };
    const user = db.users.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User not found in system.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token has expired or is invalid.',
      error: err.message,
    });
  }
}

export function requireRole(...allowedRoles: ('citizen' | 'admin')[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This resource requires [${allowedRoles.join(', ')}] role authority. Current role is '${req.user.role}'.`,
      });
    }

    next();
  };
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
      const user = db.users.findById(decoded.id);
      if (user && user.isActive) {
        const { password, ...safeUser } = user;
        req.user = safeUser;
      }
    } catch {
      // Ignore error for optional auth
    }
  }
  next();
}
