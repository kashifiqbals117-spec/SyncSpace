import * as notificationService from '../services/notificationService.js';
import { sendResponse } from '../utils/response.js';

export const getUserNotifications = async (req, res, next) => {
  try {
    const { limit, unreadOnly } = req.query;
    const result = await notificationService.getUserNotifications(req.user.id, {
      limit: limit ? parseInt(limit, 10) : 30,
      unreadOnly: unreadOnly === 'true',
    });
    return sendResponse(res, 200, result);
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAsRead(req.params.notificationId, req.user.id);
    return sendResponse(res, 200, result);
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    return sendResponse(res, 200, result);
  } catch (err) {
    next(err);
  }
};
