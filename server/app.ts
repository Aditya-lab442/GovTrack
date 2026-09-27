import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/config';
import authRoutes from './routes/authRoutes';
import documentTypeRoutes from './routes/documentTypeRoutes';
import requestRoutes from './routes/requestRoutes';
import adminRoutes from './routes/adminRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

// Security and middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded documents safely through dedicated routes or static with access consideration
app.use('/uploads', express.static(config.uploadDir));

// Health & System Info
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'GovTrack Civic Document & Status Tracking Engine',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    mode: config.isProduction ? 'production' : 'development',
  });
});

// Mount modular API routers
app.use('/api/auth', authRoutes);
app.use('/api/document-types', documentTypeRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Centralized error handling
app.use(errorHandler);
