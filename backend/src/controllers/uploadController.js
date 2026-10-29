import * as cloudinaryService from '../services/cloudinaryService.js';
import prisma from '../config/prisma.js';
import { BadRequestError } from '../errors/AppError.js';
import { sendResponse } from '../utils/response.js';

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError('No image file provided for upload.');
    }

    // Upload to Cloudinary with avatar dimensions
    const uploadResult = await cloudinaryService.uploadFromBuffer(req.file.buffer, {
      folder: 'syncspace/avatars',
      transformation: [
        { width: 256, height: 256, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    // Persist new avatar URL to database
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl: uploadResult.url },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return sendResponse(
      res,
      200,
      {
        user: updatedUser,
        url: uploadResult.url,
        publicId: uploadResult.publicId,
      },
      'Avatar uploaded and updated successfully.'
    );
  } catch (err) {
    next(err);
  }
};

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError('No image file provided for upload.');
    }

    const uploadResult = await cloudinaryService.uploadFromBuffer(req.file.buffer, {
      folder: 'syncspace/attachments',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    });

    return sendResponse(
      res,
      200,
      uploadResult,
      'Image uploaded successfully to Cloudinary.'
    );
  } catch (err) {
    next(err);
  }
};
