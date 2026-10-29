import prisma from '../config/prisma.js';
import { UnauthorizedError } from '../errors/AppError.js';
import { verifyToken } from '../utils/token.js';
import { config } from '../config/env.js';

export const requireAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.[config.cookieName];

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new UnauthorizedError('Authentication token is required. Please log in.'));
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return next(new UnauthorizedError('Invalid or expired authentication session.'));
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return next(new UnauthorizedError('User account associated with this session no longer exists.'));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
