import * as projectService from '../services/projectService.js';
import { sendResponse } from '../utils/response.js';
import { emitToWorkspace } from '../sockets/socketEmitter.js';

export const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(
      req.params.workspaceId,
      req.user.id,
      req.body
    );
    emitToWorkspace(req.params.workspaceId, 'project:created', project);
    return sendResponse(res, 201, project, 'Project created successfully.');
  } catch (err) {
    next(err);
  }
};

export const getWorkspaceProjects = async (req, res, next) => {
  try {
    const { search, status, sortBy, sortOrder } = req.query;
    const projects = await projectService.getWorkspaceProjects(req.params.workspaceId, {
      search,
      status,
      sortBy,
      sortOrder,
    });
    return sendResponse(res, 200, projects);
  } catch (err) {
    next(err);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.projectId);
    return sendResponse(res, 200, project);
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.projectId, req.body);
    emitToWorkspace(project.workspaceId, 'project:updated', project);
    return sendResponse(res, 200, project, 'Project updated successfully.');
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.projectId);
    const result = await projectService.deleteProject(req.params.projectId);
    emitToWorkspace(project.workspaceId, 'project:deleted', { projectId: req.params.projectId });
    return sendResponse(res, 200, null, result.message);
  } catch (err) {
    next(err);
  }
};
