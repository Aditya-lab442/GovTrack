import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'govtrack-super-secure-production-jwt-key-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  mongoUri: process.env.MONGO_URI || '',
  uploadDir: process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads'),
  governmentApiBaseUrl: process.env.GOVERNMENT_API_BASE_URL || 'https://api.mock-gov-service.gov.in/v1',
  governmentApiKey: process.env.GOVERNMENT_API_KEY || 'demo_gov_sandbox_key_2026',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  isProduction: process.env.NODE_ENV === 'production',
};
