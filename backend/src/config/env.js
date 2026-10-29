import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres@localhost:5433/syncspace?schema=public',
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-super-secret-key-at-least-32-chars-long-12345',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: process.env.COOKIE_NAME || 'syncspace_token',
  cookieSecret: process.env.COOKIE_SECRET || 'dev-cookie-secret-key-32-chars-syncspace-2026',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
};

if (!config.jwtSecret || config.jwtSecret.length < 16) {
  console.warn('WARNING: JWT_SECRET is missing or insecure.');
}
