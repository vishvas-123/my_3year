const prisma = require('../config/prisma');

const onlineUsers = new Map(); // userId -> Set of socketIds

function initializeSocket(io) {
  io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // Register user to personal room
    socket.on('register_user', (userId) => {
      if (!userId) return;
      socket.userId = userId;
      socket.join(`user:${userId}`);

      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);

      io.emit('user_status', {
        userId,
        status: 'online',
        onlineCount: onlineUsers.size
      });

      console.log(`👤 User registered on socket: ${userId}`);
    });

    // Join project room
    socket.on('join_project', (projectId) => {
      if (!projectId) return;
      socket.join(`project:${projectId}`);
      console.log(`📁 Socket ${socket.id} joined project room: ${projectId}`);
    });

    // Leave project room
    socket.on('leave_project', (projectId) => {
      if (!projectId) return;
      socket.leave(`project:${projectId}`);
    });

    // Typing indicators
    socket.on('typing_direct', ({ receiverId, isTyping }) => {
      if (!socket.userId || !receiverId) return;
      io.to(`user:${receiverId}`).emit('peer_typing', {
        senderId: socket.userId,
        isTyping
      });
    });

    socket.on('typing_project', ({ projectId, isTyping, userName }) => {
      if (!socket.userId || !projectId) return;
      socket.to(`project:${projectId}`).emit('project_peer_typing', {
        projectId,
        userId: socket.userId,
        userName,
        isTyping
      });
    });

    // Send direct 1-on-1 message
    socket.on('send_direct_message', async (data, callback) => {
      try {
        const { receiverId, content } = data;
        const senderId = socket.userId;

        if (!senderId || !receiverId || !content?.trim()) {
          if (callback) callback({ success: false, error: 'Missing required message fields' });
          return;
        }

        const message = await prisma.message.create({
          data: {
            senderId,
            receiverId,
            content: content.trim()
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        });

        // Emit to both receiver and sender
        io.to(`user:${receiverId}`).emit('receive_direct_message', message);
        io.to(`user:${senderId}`).emit('message_sent', message);

        // Also create a notification for the receiver
        const notification = await prisma.notification.create({
          data: {
            userId: receiverId,
            type: 'CHAT',
            title: `New message from ${message.sender.name}`,
            message: content.length > 50 ? content.substring(0, 47) + '...' : content,
            link: `/chat?userId=${senderId}`
          }
        });

        io.to(`user:${receiverId}`).emit('new_notification', notification);

        if (callback) callback({ success: true, message });
      } catch (err) {
        console.error('Socket direct message error:', err);
        if (callback) callback({ success: false, error: err.message });
      }
    });

    // Send project group message
    socket.on('send_project_message', async (data, callback) => {
      try {
        const { projectId, content } = data;
        const senderId = socket.userId;

        if (!senderId || !projectId || !content?.trim()) {
          if (callback) callback({ success: false, error: 'Missing required fields' });
          return;
        }

        const message = await prisma.message.create({
          data: {
            senderId,
            projectId,
            content: content.trim()
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        });

        // Broadcast to everyone in the project room
        io.to(`project:${projectId}`).emit('receive_project_message', message);

        if (callback) callback({ success: true, message });
      } catch (err) {
        console.error('Socket project message error:', err);
        if (callback) callback({ success: false, error: err.message });
      }
    });

    // Broadcast task update to project room
    socket.on('task_updated', ({ projectId, task, action }) => {
      if (!projectId) return;
      io.to(`project:${projectId}`).emit('project_task_changed', { task, action });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      if (socket.userId && onlineUsers.has(socket.userId)) {
        const userSockets = onlineUsers.get(socket.userId);
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(socket.userId);
          io.emit('user_status', {
            userId: socket.userId,
            status: 'offline',
            onlineCount: onlineUsers.size
          });
        }
      }
    });
  });
}

module.exports = {
  initializeSocket
};
