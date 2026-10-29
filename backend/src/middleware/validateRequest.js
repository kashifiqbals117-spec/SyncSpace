import { BadRequestError } from '../errors/AppError.js';

export const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.safeParse(req[source]);
      if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        return next(new BadRequestError('Validation error', details));
      }
      req[source] = parsed.data;
      next();
    } catch (err) {
      next(err);
    }
  };
};
