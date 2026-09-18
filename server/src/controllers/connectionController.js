const prisma = require('../config/prisma');

/**
 * Get all connections for logged in student
 */
async function getConnections(req, res, next) {
  try {
    const userId = req.user.id;

    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            college: true,
            avatar: true,
            bio: true,
            skills: { include: { skill: true } }
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            college: true,
            avatar: true,
            bio: true,
            skills: { include: { skill: true } }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const accepted = [];
    const pendingReceived = [];
    const pendingSent = [];

    for (const c of connections) {
      const isRequester = c.requesterId === userId;
      const partner = isRequester ? c.receiver : c.requester;

      const formatted = {
        id: c.id,
        status: c.status,
        note: c.note,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        partner,
        isRequester
      };

      if (c.status === 'ACCEPTED') {
        accepted.push(formatted);
      } else if (c.status === 'PENDING') {
        if (isRequester) {
          pendingSent.push(formatted);
        } else {
          pendingReceived.push(formatted);
        }
      }
    }

    res.json({
      success: true,
      accepted,
      pendingReceived,
      pendingSent
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Send connection request to another student
 */
async function sendRequest(req, res, next) {
  try {
    const requesterId = req.user.id;
    const { receiverId, note } = req.body;

    if (!receiverId) {
      return res.status(400).json({ success: false, message: 'Receiver ID is required.' });
    }

    if (requesterId === receiverId) {
      return res.status(400).json({ success: false, message: 'Cannot connect with yourself.' });
    }

    // Check if connection already exists
    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId, receiverId },
          { requesterId: receiverId, receiverId: requesterId }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: existing.status === 'ACCEPTED'
          ? 'You are already connected with this student.'
          : 'A connection request is already pending between you.'
      });
    }

    const connection = await prisma.connection.create({
      data: {
        requesterId,
        receiverId,
        note: note?.trim() || null,
        status: 'PENDING'
      },
      include: {
        receiver: { select: { id: true, name: true } }
      }
    });

    // Notify receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'CONNECTION',
        title: 'New Connection Request 🤝',
        message: `${req.user.name} would like to connect with you for skill exchange.`,
        link: '/skills'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Connection request sent successfully!',
      connection
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Accept or reject a connection request
 */
async function respondRequest(req, res, next) {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'ACCEPT' or 'REJECT'
    const userId = req.user.id;

    const connection = await prisma.connection.findUnique({
      where: { id },
      include: {
        requester: { select: { id: true, name: true } }
      }
    });

    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection request not found.' });
    }

    if (connection.receiverId !== userId) {
      return res.status(403).json({ success: false, message: 'Only the recipient can respond to this request.' });
    }

    if (action === 'ACCEPT') {
      const updated = await prisma.connection.update({
        where: { id },
        data: { status: 'ACCEPTED' }
      });

      // Notify requester
      await prisma.notification.create({
        data: {
          userId: connection.requesterId,
          type: 'CONNECTION',
          title: 'Connection Accepted! 🎉',
          message: `${req.user.name} accepted your connection request. Start chatting now!`,
          link: `/chat?userId=${userId}`
        }
      });

      return res.json({ success: true, message: 'Connection accepted!', connection: updated });
    } else {
      await prisma.connection.delete({ where: { id } });
      return res.json({ success: true, message: 'Connection request declined.' });
    }
  } catch (err) {
    next(err);
  }
}

/**
 * Remove connection
 */
async function removeConnection(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const connection = await prisma.connection.findUnique({ where: { id } });

    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection not found.' });
    }

    if (connection.requesterId !== userId && connection.receiverId !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to remove this connection.' });
    }

    await prisma.connection.delete({ where: { id } });

    res.json({ success: true, message: 'Connection removed.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getConnections,
  sendRequest,
  respondRequest,
  removeConnection
};
