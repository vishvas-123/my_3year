const prisma = require('../config/prisma');

/**
 * Get all active conversation threads (direct peers + project channels)
 */
async function getConversations(req, res, next) {
  try {
    const userId = req.user.id;

    // 1. Get all connected students
    const connections = await prisma.connection.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [
          { requesterId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        requester: { select: { id: true, name: true, avatar: true, college: true } },
        receiver: { select: { id: true, name: true, avatar: true, college: true } }
      }
    });

    const directPartners = connections.map(c => {
      return c.requesterId === userId ? c.receiver : c.requester;
    });

    // For each partner, fetch the latest message and unread count
    const directConversations = [];
    for (const partner of directPartners) {
      const lastMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: partner.id },
            { senderId: partner.id, receiverId: userId }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });

      const unreadCount = await prisma.message.count({
        where: {
          senderId: partner.id,
          receiverId: userId,
          isRead: false
        }
      });

      directConversations.push({
        id: partner.id,
        type: 'DIRECT',
        title: partner.name,
        avatar: partner.avatar,
        college: partner.college,
        lastMessage: lastMessage ? lastMessage.content : null,
        lastMessageTime: lastMessage ? lastMessage.createdAt : null,
        unreadCount
      });
    }

    // 2. Get all projects where user is an accepted member
    const projectMemberships = await prisma.projectMember.findMany({
      where: {
        userId,
        status: 'ACCEPTED'
      },
      include: {
        project: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    const projectConversations = projectMemberships.map(m => {
      const p = m.project;
      const lastMsg = p.messages[0];
      return {
        id: p.id,
        type: 'PROJECT',
        title: p.title,
        avatar: null,
        techStack: p.techStack,
        lastMessage: lastMsg ? lastMsg.content : null,
        lastMessageTime: lastMsg ? lastMsg.createdAt : null,
        unreadCount: 0
      };
    });

    // Sort by latest message
    const allConversations = [...directConversations, ...projectConversations].sort((a, b) => {
      const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
      const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
      return timeB - timeA;
    });

    res.json({ success: true, conversations: allConversations });
  } catch (err) {
    next(err);
  }
}

/**
 * Get direct messages with another student
 */
async function getDirectMessages(req, res, next) {
  try {
    const userId = req.user.id;
    const { partnerId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Mark received messages as read
    await prisma.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: userId,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
}

/**
 * Get project room messages
 */
async function getProjectMessages(req, res, next) {
  try {
    const userId = req.user.id;
    const { projectId } = req.params;

    // Check membership
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
        status: 'ACCEPTED'
      }
    });

    if (!membership && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You must be a project member to view discussion.' });
    }

    const messages = await prisma.message.findMany({
      where: { projectId },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getConversations,
  getDirectMessages,
  getProjectMessages
};
