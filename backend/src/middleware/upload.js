import multer from 'multer';
import { BadRequestError } from '../errors/AppError.js';

// Use in-memory storage so buffers can be streamed directly to Cloudinary
const storage = multer.memoryStorage();

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        `Invalid file type "${file.mimetype}". Allowed types: JPEG, PNG, WebP, GIF, SVG.`
      ),
      false
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max limit
  },
  fileFilter,
});

export const uploadSingleImage = (fieldName = 'file') => {
  const multerMiddleware = upload.single(fieldName);

  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new BadRequestError('File size exceeds the 5 MB limit.'));
        }
        return next(new BadRequestError(`File upload error: ${err.message}`));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};
