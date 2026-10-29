import { AppError } from '../errors/AppError.js';
import { config } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof AppError)) {
    // Handle specific Prisma or JWT errors
    if (error.name === 'JsonWebTokenError') {
      error = new AppError('Invalid authentication token', 401);
    } else if (error.name === 'TokenExpiredError') {
      error = new AppError('Authentication session has expired', 401);
    } else if (error.code === 'P2002') {
      const field = error.meta?.target ? ` (${error.meta.target.join(', ')})` : '';
      error = new AppError(`A resource with this identifier already exists${field}.`, 409);
    } else if (error.code === 'P2025') {
      error = new AppError('The requested resource was not found.', 404);
    } else {
      const message = error.message || 'Internal Server Error';
      error = new AppError(message, error.statusCode || 500);
    }
  }

  const statusCode = error.statusCode || 500;
  const responseBody = {
    success: false,
    message: error.message,
  };

  if (error.details) {
    responseBody.details = error.details;
  }

  if (config.nodeEnv === 'development' || config.nodeEnv === 'test') {
    if (statusCode === 500) {
      responseBody.stack = err.stack;
    }
  }

  // Log 500 internal errors for debugging
  if (statusCode === 500 && config.nodeEnv !== 'test') {
    console.error('Unhandled Server Error:', err);
  }

  res.status(statusCode).json(responseBody);
};
