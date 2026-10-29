import prisma from '../config/prisma.js';
import { NotFoundError } from '../errors/AppError.js';

export const getUserNotifications = async (userId, { limit = 30, unreadOnly = false }) => {
  const where = {
    userId,
    ...(unreadOnly ? { read: false } : {}),
  };

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.notification.count({
      where: { userId, read: false },
    }),
  ]);

  return {
    notifications,
    unreadCount,
  };
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.userId !== userId) {
    throw new NotFoundError('Notification not found.');
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });

  const unreadCount = await prisma.notification.count({
    where: { userId, read: false },
  });

  return { notification: updated, unreadCount };
};

export const markAllAsRead = async (userId) => {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  return { message: 'All notifications marked as read.', unreadCount: 0 };
};
