import * as taskService from '../services/taskService.js';
import { sendResponse } from '../utils/response.js';
import { emitToProject, emitToUser } from '../sockets/socketEmitter.js';
import { SOCKET_EVENTS } from '../constants/events.js';

export const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.params.projectId, req.user.id, req.body);
    emitToProject(req.params.projectId, SOCKET_EVENTS.TASK_CREATED, task);
    if (task.assigneeId && task.assigneeId !== req.user.id) {
      emitToUser(task.assigneeId, SOCKET_EVENTS.NOTIFICATION_NEW, {
        title: 'New Task Assigned',
        message: `${req.user.name} assigned you to "${task.title}".`,
      });
    }
    return sendResponse(res, 201, task, 'Task created successfully.');
  } catch (err) {
    next(err);
  }
};

export const getProjectTasks = async (req, res, next) => {
  try {
    const { status, priority, assigneeId, search } = req.query;
    const tasks = await taskService.getProjectTasks(req.params.projectId, {
      status,
      priority,
      assigneeId,
      search,
    });
    return sendResponse(res, 200, tasks);
  } catch (err) {
    next(err);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.taskId);
    return sendResponse(res, 200, task);
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.taskId, req.user.id, req.body);
    emitToProject(task.projectId, SOCKET_EVENTS.TASK_UPDATED, task);
    return sendResponse(res, 200, task, 'Task updated successfully.');
  } catch (err) {
    next(err);
  }
};

export const moveTask = async (req, res, next) => {
  try {
    const task = await taskService.moveTask(req.params.taskId, req.user.id, req.body);
    emitToProject(task.projectId, SOCKET_EVENTS.TASK_MOVED, task);
    return sendResponse(res, 200, task, 'Task moved successfully.');
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { message, task } = await taskService.deleteTask(req.params.taskId);
    emitToProject(task.projectId, SOCKET_EVENTS.TASK_DELETED, {
      taskId: req.params.taskId,
      projectId: task.projectId,
    });
    return sendResponse(res, 200, null, message);
  } catch (err) {
    next(err);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { comment, task } = await taskService.addComment(
      req.params.taskId,
      req.user.id,
      req.body.content
    );
    emitToProject(task.projectId, SOCKET_EVENTS.COMMENT_CREATED, {
      taskId: req.params.taskId,
      comment,
    });
    return sendResponse(res, 201, comment, 'Comment added successfully.');
  } catch (err) {
    next(err);
  }
};

export const getMyTasks = async (req, res, next) => {
  try {
    const { status, priority, sortBy, sortOrder } = req.query;
    const tasks = await taskService.getMyTasks(req.user.id, {
      status,
      priority,
      sortBy,
      sortOrder,
    });
    return sendResponse(res, 200, tasks);
  } catch (err) {
    next(err);
  }
};
