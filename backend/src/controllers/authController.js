import * as authService from '../services/authService.js';
import { sendResponse } from '../utils/response.js';
import { setAuthCookie, clearAuthCookie, signToken } from '../utils/token.js';

export const register = async (req, res, next) => {
  try {
    const { user, token, defaultWorkspaceId } = await authService.register(req.body);
    setAuthCookie(res, token);
    return sendResponse(
      res,
      201,
      { user, token, defaultWorkspaceId },
      'Account created successfully.'
    );
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);
    setAuthCookie(res, token);
    return sendResponse(res, 200, { user, token }, 'Logged in successfully.');
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    clearAuthCookie(res);
    return sendResponse(res, 200, null, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return sendResponse(res, 200, user);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    return sendResponse(res, 200, user, 'Profile updated successfully.');
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body);
    return sendResponse(res, 200, result, result.message);
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);
    return sendResponse(res, 200, null, result.message);
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = signToken({ userId: req.user.id });
    setAuthCookie(res, token);
    return sendResponse(res, 200, { user: req.user, token }, 'Session refreshed.');
  } catch (err) {
    next(err);
  }
};
