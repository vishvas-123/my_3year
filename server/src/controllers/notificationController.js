const prisma = require('../config/prisma');

/**
 * Get all notifications for current user
 */
async function getNotifications(req, res, next) {
  try {
    const userId = req.user.id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({ success: true, unreadCount, notifications });
  } catch (err) {
    next(err);
  }
}

/**
 * Mark notification(s) as read
 */
async function markAsRead(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });
      return res.json({ success: true, message: 'All notifications marked as read.' });
    }

    const updated = await prisma.notification.update({
      where: { id, userId },
      data: { isRead: true }
    });

    res.json({ success: true, notification: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete notification
 */
async function deleteNotification(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await prisma.notification.delete({
      where: { id, userId }
    });

    res.json({ success: true, message: 'Notification removed.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotification
};
