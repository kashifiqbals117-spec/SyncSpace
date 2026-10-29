import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/prisma.js';
import { BadRequestError, ConflictError, UnauthorizedError, NotFoundError } from '../errors/AppError.js';
import { signToken } from '../utils/token.js';
import { ROLES } from '../constants/roles.js';

export const register = async ({ name, email, password }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictError('An account with this email address already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Create user and initial personal workspace in transaction
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
    const workspace = await tx.workspace.create({
      data: {
        name: `${name}'s Workspace`,
        slug,
        ownerId: user.id,
      },
    });

    await tx.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: ROLES.OWNER,
      },
    });

    // Create a Welcome project
    const project = await tx.project.create({
      data: {
        workspaceId: workspace.id,
        name: 'Welcome to SyncSpace',
        description: 'Get started with your collaborative workspace.',
        creatorId: user.id,
        color: '#6366f1',
      },
    });

    // Create a starter task
    await tx.task.create({
      data: {
        projectId: project.id,
        title: 'Explore your Kanban board',
        description: 'Drag this task card between columns to update its status in real-time!',
        status: 'TODO',
        priority: 'MEDIUM',
        creatorId: user.id,
        assigneeId: user.id,
        position: 1000.0,
      },
    });

    return { user, workspace };
  });

  const token = signToken({ userId: result.user.id });

  return {
    user: result.user,
    token,
    defaultWorkspaceId: result.workspace.id,
  };
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  const token = signToken({ userId: user.id });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    },
    token,
  };
};

export const forgotPassword = async ({ email }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Return friendly generic message to prevent email enumeration
    return {
      message: 'If an account exists with that email, a password reset link has been prepared.',
    };
  }

  // Generate cryptographically secure reset token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const devResetUrl = `/reset-password?token=${rawToken}`;

  return {
    message: 'If an account exists with that email, a password reset link has been prepared.',
    devResetToken: rawToken,
    devResetUrl,
  };
};

export const resetPassword = async ({ token, newPassword }) => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!resetRecord || resetRecord.usedAt || new Date() > resetRecord.expiresAt) {
    throw new BadRequestError('Invalid or expired password reset token.');
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash: newHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { message: 'Password has been reset successfully. You can now log in.' };
};

export const updateProfile = async (userId, data) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  return user;
};

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      createdAt: true,
      memberships: {
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('User not found.');
  }

  return user;
};
