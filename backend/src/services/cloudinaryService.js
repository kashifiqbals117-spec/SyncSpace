import { Readable } from 'stream';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import { AppError } from '../errors/AppError.js';

export const uploadFromBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(
        new AppError('Cloudinary is not configured. Missing credentials.', 500)
      );
    }

    const defaultOptions = {
      folder: 'syncspace',
      resource_type: 'image',
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      defaultOptions,
      (error, result) => {
        if (error) {
          return reject(
            new AppError(`Cloudinary upload failed: ${error.message}`, 500, error)
          );
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  if (!isCloudinaryConfigured() || !publicId) return null;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (err) {
    console.error(`Failed to delete asset ${publicId} from Cloudinary:`, err);
    return null;
  }
};
