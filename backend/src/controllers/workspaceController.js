import * as workspaceService from '../services/workspaceService.js';
import { sendResponse } from '../utils/response.js';
import { emitToWorkspace, emitToUser } from '../sockets/socketEmitter.js';
import { SOCKET_EVENTS } from '../constants/events.js';

export const createWorkspace = async (req, res, next) => {
  try {
    const workspace = await workspaceService.createWorkspace(req.user.id, req.body);
    return sendResponse(res, 201, workspace, 'Workspace created successfully.');
  } catch (err) {
    next(err);
  }
};

export const getUserWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await workspaceService.getUserWorkspaces(req.user.id);
    return sendResponse(res, 200, workspaces);
  } catch (err) {
    next(err);
  }
};

export const getWorkspaceById = async (req, res, next) => {
  try {
    const workspace = await workspaceService.getWorkspaceById(req.params.workspaceId, req.user.id);
    return sendResponse(res, 200, workspace);
  } catch (err) {
    next(err);
  }
};

export const updateWorkspace = async (req, res, next) => {
  try {
    const workspace = await workspaceService.updateWorkspace(req.params.workspaceId, req.body);
    emitToWorkspace(workspace.id, 'workspace:updated', workspace);
    return sendResponse(res, 200, workspace, 'Workspace updated successfully.');
  } catch (err) {
    next(err);
  }
};

export const deleteWorkspace = async (req, res, next) => {
  try {
    const result = await workspaceService.deleteWorkspace(req.params.workspaceId, req.user.id);
    emitToWorkspace(req.params.workspaceId, 'workspace:deleted', { workspaceId: req.params.workspaceId });
    return sendResponse(res, 200, null, result.message);
  } catch (err) {
    next(err);
  }
};

export const getWorkspaceMembers = async (req, res, next) => {
  try {
    const members = await workspaceService.getWorkspaceMembers(req.params.workspaceId);
    return sendResponse(res, 200, members);
  } catch (err) {
    next(err);
  }
};

export const inviteMember = async (req, res, next) => {
  try {
    const result = await workspaceService.inviteMember(req.params.workspaceId, req.user.id, req.body);
    return sendResponse(res, 201, result, 'Invitation created successfully.');
  } catch (err) {
    next(err);
  }
};

export const acceptInvitation = async (req, res, next) => {
  try {
    const result = await workspaceService.acceptInvitation(req.body.token, req.user.id);
    emitToWorkspace(result.workspaceId, SOCKET_EVENTS.MEMBER_JOINED, { userId: req.user.id });
    return sendResponse(res, 200, result, result.message);
  } catch (err) {
    next(err);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const result = await workspaceService.removeMember(
      req.params.workspaceId,
      req.params.userId,
      req.user.id
    );
    emitToWorkspace(req.params.workspaceId, SOCKET_EVENTS.MEMBER_REMOVED, {
      userId: req.params.userId,
    });
    emitToUser(req.params.userId, 'workspace:membership_revoked', {
      workspaceId: req.params.workspaceId,
    });
    return sendResponse(res, 200, null, result.message);
  } catch (err) {
    next(err);
  }
};

export const updateMemberRole = async (req, res, next) => {
  try {
    const member = await workspaceService.updateMemberRole(
      req.params.workspaceId,
      req.params.userId,
      req.body.role,
      req.user.id
    );
    emitToWorkspace(req.params.workspaceId, SOCKET_EVENTS.MEMBER_UPDATED, member);
    return sendResponse(res, 200, member, 'Member role updated successfully.');
  } catch (err) {
    next(err);
  }
};
