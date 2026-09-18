import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [notificationsCount, setNotificationsCount] = useState(0);

  useEffect(() => {
    if (user?.unreadNotifications) {
      setNotificationsCount(user.unreadNotifications);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to server (using proxy or window location)
    const newSocket = io('/', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('⚡ Connected to SkillBridge real-time network');
      newSocket.emit('register_user', user.id);
    });

    newSocket.on('new_notification', (notification) => {
      setNotificationsCount(prev => prev + 1);
    });

    newSocket.on('user_status', ({ userId, status }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        if (status === 'online') {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?.id]);

  const clearNotificationsCount = () => {
    setNotificationsCount(0);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        notificationsCount,
        setNotificationsCount,
        clearNotificationsCount
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext) || {};
}
