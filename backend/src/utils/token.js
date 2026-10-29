import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const signToken = (payload, expiresIn = config.jwtExpiresIn) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
};

export const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

export const getCookieOptions = () => {
  return {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/',
  };
};

export const setAuthCookie = (res, token) => {
  res.cookie(config.cookieName, token, getCookieOptions());
};

export const clearAuthCookie = (res) => {
  res.clearCookie(config.cookieName, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    path: '/',
  });
};
