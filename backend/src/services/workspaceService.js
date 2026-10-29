import crypto from 'crypto';
import prisma from '../config/prisma.js';
import { BadRequestError, ForbiddenError, NotFoundError, ConflictError } from '../errors/AppError.js';
import { ROLES } from '../constants/roles.js';
import { INVITATION_STATUS, NOTIFICATION_TYPE } from '../constants/statuses.js';

export const createWorkspace = async (userId, { name, description }) => {
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

  const workspace = await prisma.$transaction(async (tx) => {
    const ws = await tx.workspace.create({
      data: {
        name,
        description,
        slug,
        ownerId: userId,
      },
    });

    await tx.workspaceMember.create({
      data: {
        workspaceId: ws.id,
        userId,
        role: ROLES.OWNER,
      },
    });

    return ws;
  });

  return workspace;
};

export const getUserWorkspaces = async (userId) => {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        include: {
          _count: {
            select: {
              members: true,
              projects: true,
            },
          },
        },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });

  return memberships.map((m) => ({
    ...m.workspace,
    role: m.role,
    joinedAt: m.joinedAt,
    memberCount: m.workspace._count.members,
    projectCount: m.workspace._count.projects,
  }));
};

export const getWorkspaceById = async (workspaceId, userId) => {
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new ForbiddenError('You do not have access to this workspace.');
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      owner: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
        orderBy: { joinedAt: 'asc' },
      },
      projects: {
        include: {
          _count: {
            select: { tasks: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: { members: true, projects: true },
      },
    },
  });

  if (!workspace) {
    throw new NotFoundError('Workspace not found.');
  }

  return {
    ...workspace,
    userRole: membership.role,
  };
};

export const updateWorkspace = async (workspaceId, { name, description }) => {
  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
    },
  });

  return workspace;
};

export const deleteWorkspace = async (workspaceId, userId) => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    throw new NotFoundError('Workspace not found.');
  }

  if (workspace.ownerId !== userId) {
    throw new ForbiddenError('Only the workspace owner can delete this workspace.');
  }

  await prisma.workspace.delete({
    where: { id: workspaceId },
  });

  return { message: 'Workspace deleted successfully.' };
};

export const getWorkspaceMembers = async (workspaceId) => {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });

  return members;
};

export const inviteMember = async (workspaceId, inviterId, { email, role = ROLES.MEMBER }) => {
  // Check if user is already a member
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const isMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: existingUser.id,
        },
      },
    });
    if (isMember) {
      throw new ConflictError('User is already a member of this workspace.');
    }
  }

  // Check existing pending invitation
  const existingInvite = await prisma.workspaceInvitation.findFirst({
    where: {
      workspaceId,
      email,
      status: INVITATION_STATUS.PENDING,
      expiresAt: { gt: new Date() },
    },
  });

  if (existingInvite) {
    throw new ConflictError('A pending invitation has already been sent to this email.');
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invitation = await prisma.workspaceInvitation.create({
    data: {
      workspaceId,
      email,
      role,
      tokenHash,
      expiresAt,
      inviterId,
    },
    include: {
      workspace: { select: { name: true } },
      inviter: { select: { name: true, email: true } },
    },
  });

  // If user already exists in the system, notify them
  if (existingUser) {
    await prisma.notification.create({
      data: {
        userId: existingUser.id,
        type: NOTIFICATION_TYPE.WORKSPACE_INVITE,
        title: 'Workspace Invitation',
        message: `${invitation.inviter.name} invited you to join "${invitation.workspace.name}".`,
        link: `/invitations/${rawToken}`,
      },
    });
  }

  return {
    invitation: {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
    },
    invitationToken: rawToken,
    invitationUrl: `/invitations/${rawToken}`,
  };
};

export const acceptInvitation = async (token, userId) => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const invite = await prisma.workspaceInvitation.findUnique({
    where: { tokenHash },
    include: { workspace: true },
  });

  if (!invite) {
    throw new NotFoundError('Invitation not found or invalid token.');
  }

  if (invite.status !== INVITATION_STATUS.PENDING || new Date() > invite.expiresAt) {
    throw new BadRequestError('Invitation has expired or already been processed.');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
    throw new ForbiddenError(`This invitation was sent to ${invite.email}. You are logged in as ${user.email}.`);
  }

  await prisma.$transaction([
    prisma.workspaceMember.create({
      data: {
        workspaceId: invite.workspaceId,
        userId,
        role: invite.role,
      },
    }),
    prisma.workspaceInvitation.update({
      where: { id: invite.id },
      data: { status: INVITATION_STATUS.ACCEPTED },
    }),
  ]);

  return {
    message: `You have successfully joined ${invite.workspace.name}.`,
    workspaceId: invite.workspaceId,
  };
};

export const removeMember = async (workspaceId, targetUserId, currentUserId) => {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });

  if (!workspace) {
    throw new NotFoundError('Workspace not found.');
  }

  if (workspace.ownerId === targetUserId) {
    throw new BadRequestError('The workspace owner cannot be removed.');
  }

  // Can leave voluntarily or admin/owner can remove
  if (targetUserId !== currentUserId) {
    const currentMember = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: currentUserId } },
    });
    if (!currentMember || (currentMember.role !== ROLES.OWNER && currentMember.role !== ROLES.ADMIN)) {
      throw new ForbiddenError('Only workspace owners or admins can remove other members.');
    }
  }

  await prisma.workspaceMember.delete({
    where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
  });

  return { message: 'Member removed from workspace.' };
};

export const updateMemberRole = async (workspaceId, targetUserId, newRole, currentUserId) => {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (workspace.ownerId === targetUserId && newRole !== ROLES.OWNER) {
    throw new BadRequestError('Workspace owner cannot be demoted.');
  }

  const currentMember = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: currentUserId } },
  });

  if (!currentMember || currentMember.role !== ROLES.OWNER) {
    throw new ForbiddenError('Only the workspace owner can modify member roles.');
  }

  const updated = await prisma.workspaceMember.update({
    where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
    data: { role: newRole },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  return updated;
};
