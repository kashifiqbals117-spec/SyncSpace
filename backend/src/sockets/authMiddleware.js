import { verifyToken } from '../utils/token.js';
import prisma from '../config/prisma.js';
import { config } from '../config/env.js';

export const socketAuthMiddleware = async (socket, next) => {
  try {
    let token = socket.handshake.auth?.token;

    // Check cookie in handshake headers
    if (!token && socket.handshake.headers.cookie) {
      const cookies = socket.handshake.headers.cookie.split(';').reduce((acc, c) => {
        const [k, v] = c.trim().split('=');
        if (k && v) acc[k] = decodeURIComponent(v);
        return acc;
      }, {});
      token = cookies[config.cookieName];
    }

    if (!token) {
      return next(new Error('Authentication error: Missing token'));
    }

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, avatarUrl: true },
    });

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid session'));
  }
};
