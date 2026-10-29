import { NotFoundError } from '../errors/AppError.js';

export const notFound = (req, res, next) => {
  next(new NotFoundError(`Endpoint not found: ${req.method} ${req.originalUrl}`));
};
