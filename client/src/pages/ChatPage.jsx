import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  MessageSquare,
  Send,
  Users,
  Search,
  CheckCheck,
  FolderGit2,
  Smile,
  Loader2
} from 'lucide-react';

export default function ChatPage() {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [searchParams] = useSearchParams();
  const defaultPartnerId = searchParams.get('userId');

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, partnerTyping]);

  // Handle Socket.IO events for real-time messaging
  useEffect(() => {
    if (!socket) return;

    const handleDirectMessage = (msg) => {
      // If the incoming message belongs to current active thread
      if (
        activeConversation &&
        activeConversation.type === 'DIRECT' &&
        (msg.senderId === activeConversation.id || msg.receiverId === activeConversation.id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
      // Update thread last message
      fetchConversations();
    };

    const handlePeerTyping = ({ senderId, isTyping }) => {
      if (activeConversation && activeConversation.id === senderId) {
        setPartnerTyping(isTyping);
      }
    };

    socket.on('receive_direct_message', handleDirectMessage);
    socket.on('message_sent', handleDirectMessage);
    socket.on('peer_typing', handlePeerTyping);

    return () => {
      socket.off('receive_direct_message', handleDirectMessage);
      socket.off('message_sent', handleDirectMessage);
      socket.off('peer_typing', handlePeerTyping);
    };
  }, [socket, activeConversation]);

  const fetchConversations = async () => {
    try {
      setLoadingConv(true);
      const res = await api.get('/chat/conversations');
      if (res.data.success) {
        setConversations(res.data.conversations);

        // If URL has ?userId=..., pre-select that thread
        if (defaultPartnerId) {
          const match = res.data.conversations.find((c) => c.id === defaultPartnerId);
          if (match) {
            selectConversation(match);
          } else {
            // Fetch public profile if not yet in threads list
            try {
              const uRes = await api.get(`/users/${defaultPartnerId}`);
              if (uRes.data.success) {
                const partnerObj = {
                  id: uRes.data.profile.id,
                  type: 'DIRECT',
                  title: uRes.data.profile.name,
                  avatar: uRes.data.profile.avatar,
                  college: uRes.data.profile.college,
                  unreadCount: 0
                };
                setActiveConversation(partnerObj);
                loadMessages(partnerObj);
              }
            } catch (e) {
              console.error(e);
            }
          }
        } else if (res.data.conversations.length > 0 && !activeConversation) {
          selectConversation(res.data.conversations[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingConv(false);
    }
  };

  const selectConversation = (conv) => {
    setActiveConversation(conv);
    setPartnerTyping(false);
    loadMessages(conv);
  };

  const loadMessages = async (conv) => {
    try {
      setLoadingMsgs(true);
      let res;
      if (conv.type === 'DIRECT') {
        res = await api.get(`/chat/direct/${conv.id}`);
      } else {
        res = await api.get(`/chat/project/${conv.id}`);
      }

      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    // Typing emission
    if (socket && activeConversation && activeConversation.type === 'DIRECT') {
      socket.emit('typing_direct', {
        receiverId: activeConversation.id,
        isTyping: true
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_direct', {
          receiverId: activeConversation.id,
          isTyping: false
        });
      }, 1500);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConversation || !socket) return;

    if (activeConversation.type === 'DIRECT') {
      socket.emit('send_direct_message', {
        receiverId: activeConversation.id,
        content: inputMessage.trim()
      });
    } else {
      socket.emit('send_project_message', {
        projectId: activeConversation.id,
        content: inputMessage.trim()
      });
    }

    setInputMessage('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto h-[calc(100vh-5rem)] flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Real-Time Collaboration Chat
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Direct 1-on-1 skill exchange channels and project repository team messaging.
        </p>
      </div>

      {/* Main chat window container */}
      <div className="flex-1 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Left Sidebar: Conversations list */}
        <div className="w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Messages & Channels
            </h2>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter conversations..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {loadingConv ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No active conversations yet. Connect with a student on Skill Exchange to start chatting!
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = activeConversation?.id === conv.id;
                const isOnline = onlineUsers.has(conv.id);

                return (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full p-3.5 text-left transition-colors flex items-start gap-3 cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="relative shrink-0">
                      {conv.type === 'DIRECT' ? (
                        conv.avatar ? (
                          <img
                            src={conv.avatar}
                            alt={conv.title}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                            {conv.title.slice(0, 2).toUpperCase()}
                          </div>
                        )
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                          <FolderGit2 className="w-5 h-5" />
                        </div>
                      )}

                      {/* Online indicator */}
                      {conv.type === 'DIRECT' && isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {conv.title}
                        </h4>
                        {conv.lastMessageTime && (
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(conv.lastMessageTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {conv.lastMessage || 'Start conversation...'}
                      </p>

                      {conv.unreadCount > 0 && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                          {conv.unreadCount} new
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Active Message Thread */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 dark:bg-slate-950/40">
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="p-3.5 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {activeConversation.type === 'DIRECT' ? (
                    activeConversation.avatar ? (
                      <img
                        src={activeConversation.avatar}
                        alt={activeConversation.title}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                        {activeConversation.title.slice(0, 2).toUpperCase()}
                      </div>
                    )
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                      <FolderGit2 className="w-4 h-4" />
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {activeConversation.title}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {activeConversation.type === 'DIRECT'
                        ? onlineUsers.has(activeConversation.id)
                          ? 'Online now'
                          : activeConversation.college || 'Student'
                        : 'Project Collaboration Team Channel'}
                    </p>
                  </div>
                </div>

                {activeConversation.type === 'DIRECT' && (
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Connected Peer
                  </span>
                )}
              </div>

              {/* Message history */}
              <div className="flex-1 p-6 overflow-y-auto space-y-3">
                {loadingMsgs ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-24 text-xs text-slate-400">
                    No messages in this chat yet. Say hello to {activeConversation.title}!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <img
                          src={msg.sender?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={msg.sender?.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div
                          className={`max-w-[70%] p-3.5 rounded-2xl text-xs space-y-1 ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-xs border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {!isMe && activeConversation.type === 'PROJECT' && (
                            <p className="font-bold text-[10px] text-indigo-600 dark:text-indigo-400 mb-0.5">
                              {msg.sender?.name}
                            </p>
                          )}
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          <span className="block text-[9px] opacity-60 text-right">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Partner typing notification */}
                {partnerTyping && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span>{activeConversation.title} is typing...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Field */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={handleInputChange}
                  placeholder={`Message ${activeConversation.title}...`}
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 mb-3 text-indigo-400" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Select a Conversation
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Choose a peer from the left sidebar to start real-time messaging or join a project room.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
