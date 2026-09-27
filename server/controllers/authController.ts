import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db/database';
import { AuthRequest, generateToken } from '../middleware/auth';
import { auditService } from '../services/auditService';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  mobileNumber: z.string().min(10, 'Mobile number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  address: z.string().optional().default(''),
  city: z.string().optional().default(''),
  district: z.string().optional().default(''),
  state: z.string().optional().default(''),
  pincode: z.string().optional().default(''),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const authController = {
  register: async (req: AuthRequest, res: Response) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        });
      }

      const { email, password, firstName, lastName, mobileNumber, address, city, district, state, pincode } = parsed.data;

      const existingUser = db.users.findOne((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please sign in.',
        });
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const newUser = db.users.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        mobileNumber,
        password: hashedPassword,
        role: 'citizen',
        address,
        city,
        district,
        state,
        pincode,
        isActive: true,
        isVerified: true,
      });

      const token = generateToken(newUser);
      auditService.log(newUser.id, 'CITIZEN_REGISTER', `New citizen account registered: ${newUser.email}`, req.ip);

      const { password: _, ...userSafe } = newUser;
      return res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: {
          user: userSafe,
          token,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  login: async (req: AuthRequest, res: Response) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid credentials format',
          errors: parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        });
      }

      const { email, password } = parsed.data;
      const user = db.users.findOne((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!user || !user.password) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'This account has been deactivated. Please contact the administrator.',
        });
      }

      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      const token = generateToken(user);
      auditService.log(user.id, user.role === 'admin' ? 'ADMIN_LOGIN' : 'USER_LOGIN', `User logged in: ${user.email}`, req.ip);

      const { password: _, ...userSafe } = user;
      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userSafe,
          token,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  getMe: async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const user = db.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User record not found' });
    }

    const { password, ...userSafe } = user;
    return res.json({
      success: true,
      data: userSafe,
    });
  },

  updateProfile: async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { firstName, lastName, mobileNumber, address, city, district, state, pincode } = req.body;
    const updated = db.users.updateById(req.user.id, {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(mobileNumber && { mobileNumber }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(district !== undefined && { district }),
      ...(state !== undefined && { state }),
      ...(pincode !== undefined && { pincode }),
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    auditService.log(req.user.id, 'PROFILE_UPDATED', `User profile updated for ${updated.email}`, req.ip);
    const { password, ...safe } = updated;
    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: safe,
    });
  },

  logout: async (req: AuthRequest, res: Response) => {
    if (req.user) {
      auditService.log(req.user.id, 'USER_LOGOUT', `User logged out: ${req.user.email}`, req.ip);
    }
    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  },
};
