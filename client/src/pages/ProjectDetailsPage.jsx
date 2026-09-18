import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import confetti from 'canvas-confetti';
import {
  FolderGit2,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  Send,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  X,
  UserPlus
} from 'lucide-react';
import { GithubIcon } from '../components/SocialIcons';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban', 'chat', 'team'

  // Task creation modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignedToId: '',
    dueDate: ''
  });
  const [creatingTask, setCreatingTask] = useState(false);

  // Invite member modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [connections, setConnections] = useState([]);
  const [selectedInviteUser, setSelectedInviteUser] = useState('');
  const [inviting, setInviting] = useState(false);

  // Project chat messages
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    fetchProjectData();
    fetchTasks();
    fetchChatMessages();
    fetchPotentialInvites();
  }, [id]);

  // Real-time socket room subscription
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('join_project', id);

    socket.on('receive_project_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('project_task_changed', ({ task, action }) => {
      if (action === 'create') setTasks(prev => [task, ...prev]);
      if (action === 'update') setTasks(prev => prev.map(t => t.id === task.id ? task : t));
      if (action === 'delete') setTasks(prev => prev.filter(t => t.id !== task.id));
    });

    return () => {
      socket.emit('leave_project', id);
      socket.off('receive_project_message');
      socket.off('project_task_changed');
    };
  }, [socket, id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        setProject(res.data.project);
      }
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks/project/${id}`);
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const res = await api.get(`/chat/project/${id}`);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error('Failed to load chat:', err);
    }
  };

  const fetchPotentialInvites = async () => {
    try {
      const res = await api.get('/connections');
      if (res.data.success) {
        setConnections(res.data.accepted.map(c => c.partner));
      }
    } catch (err) {
      console.error('Failed to load connections for invites:', err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      setCreatingTask(true);
      const res = await api.post(`/tasks/project/${id}`, taskForm);
      if (res.data.success) {
        setTasks([res.data.task, ...tasks]);
        setShowTaskModal(false);
        setTaskForm({ title: '', description: '', priority: 'MEDIUM', assignedToId: '', dueDate: '' });
        if (socket) {
          socket.emit('task_updated', { projectId: id, task: res.data.task, action: 'create' });
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
      if (res.data.success) {
        setTasks(prev => prev.map(t => t.id === taskId ? res.data.task : t));
        if (newStatus === 'DONE') {
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
        }
        if (socket) {
          socket.emit('task_updated', { projectId: id, task: res.data.task, action: 'update' });
        }
      }
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      const res = await api.delete(`/tasks/${taskId}`);
      if (res.data.success) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        if (socket) {
          socket.emit('task_updated', { projectId: id, task: { id: taskId }, action: 'delete' });
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;

    socket.emit('send_project_message', {
      projectId: id,
      content: chatInput.trim()
    });

    setChatInput('');
  };

  const handleInviteCollaborator = async () => {
    if (!selectedInviteUser) return;
    try {
      setInviting(true);
      const res = await api.post(`/projects/${id}/invite`, { userId: selectedInviteUser });
      if (res.data.success) {
        alert('Invitation sent successfully!');
        setShowInviteModal(false);
        fetchProjectData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to invite collaborator');
    } finally {
      setInviting(false);
    }
  };

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const todoTasks = tasks.filter(t => t.status === 'TODO');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter(t => t.status === 'DONE');

  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;
  const isOwner = project.ownerId === user?.id;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Back button & Title Header */}
      <div className="space-y-4">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Projects
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {project.title}
              </h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {project.description}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {project.techStack.split(',').map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {tech.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Quick links & Invite button */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            <div className="flex items-center gap-2">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-xs font-medium"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 text-xs font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Live Demo</span>
                </a>
              )}
            </div>

            {isOwner && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Invite Collaborator
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress & Tabs Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Progress summary */}
        <div className="flex items-center gap-3 w-full sm:w-72">
          <div className="flex-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              <span>Sprint Progress</span>
              <span className="text-indigo-600 dark:text-indigo-400">{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'kanban'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Kanban Board ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Team Discussion ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'team'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Team ({project.members?.length || 1})
          </button>
        </div>

        {/* Create Task Button */}
        {activeTab === 'kanban' && (
          <button
            onClick={() => setShowTaskModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </button>
        )}
      </div>

      {/* Tab 1: Kanban Board */}
      {activeTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TO DO Column */}
          <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                To Do ({todoTasks.length})
              </h3>
            </div>

            <div className="space-y-3">
              {todoTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      {t.title}
                    </h4>
                    <PriorityBadge priority={t.priority} />
                  </div>

                  {t.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {t.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      {t.assignedTo ? (
                        <img
                          src={t.assignedTo.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={t.assignedTo.name}
                          title={`Assigned to ${t.assignedTo.name}`}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400">Unassigned</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteTask(t.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleUpdateTaskStatus(t.id, 'IN_PROGRESS')}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-100 flex items-center gap-1 cursor-pointer"
                        title="Start task"
                      >
                        <span>Start</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {todoTasks.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No tasks to do</p>
              )}
            </div>
          </div>

          {/* IN PROGRESS Column */}
          <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-blue-200 dark:border-blue-900/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                In Progress ({inProgressTasks.length})
              </h3>
            </div>

            <div className="space-y-3">
              {inProgressTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 shadow-xs hover:shadow-md transition-shadow space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      {t.title}
                    </h4>
                    <PriorityBadge priority={t.priority} />
                  </div>

                  {t.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {t.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      {t.assignedTo ? (
                        <img
                          src={t.assignedTo.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={t.assignedTo.name}
                          title={`Assigned to ${t.assignedTo.name}`}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400">Unassigned</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleUpdateTaskStatus(t.id, 'TODO')}
                        className="px-1.5 py-0.5 rounded text-[10px] text-slate-500 hover:bg-slate-100 cursor-pointer"
                        title="Move back to To Do"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleUpdateTaskStatus(t.id, 'DONE')}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
                        title="Mark Done"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Done</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {inProgressTasks.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No tasks in progress</p>
              )}
            </div>
          </div>

          {/* DONE Column */}
          <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200 dark:border-emerald-900/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Completed ({doneTasks.length})
              </h3>
            </div>

            <div className="space-y-3">
              {doneTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 shadow-xs space-y-2.5 opacity-90"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-through opacity-75 leading-snug">
                      {t.title}
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      {t.assignedTo && (
                        <img
                          src={t.assignedTo.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={t.assignedTo.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      )}
                    </div>

                    <button
                      onClick={() => handleUpdateTaskStatus(t.id, 'IN_PROGRESS')}
                      className="text-[10px] text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
                    >
                      Reopen
                    </button>
                  </div>
                </div>
              ))}
              {doneTasks.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">No completed tasks yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Team Real-Time Discussion */}
      {activeTab === 'chat' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[550px]">
          {/* Chat thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-20 text-xs text-slate-400">
                No team messages yet. Start the sprint discussion!
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.senderId === user?.id;
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <img
                      src={m.sender?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={m.sender?.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div
                      className={`max-w-[70%] p-3 rounded-2xl text-xs space-y-1 ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-xs'
                      }`}
                    >
                      <p className="font-semibold text-[10px] opacity-75">
                        {m.sender?.name}
                      </p>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      <span className="block text-[9px] opacity-60 text-right">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat input box */}
          <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type team update or question..."
              className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Team Members List */}
      {activeTab === 'team' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {project.members?.map((member) => (
            <div
              key={member.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <img
                  src={member.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={member.user.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {member.user.name}
                  </h4>
                  <p className="text-xs text-slate-500">{member.user.college || 'Student'}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {member.role}
                  </span>
                </div>
              </div>

              <Link
                to={`/profile/${member.userId}`}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Profile
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Project Task</h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Implement user login API endpoint"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Details, acceptance criteria or instructions..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Assign Member
                  </label>
                  <select
                    value={taskForm.assignedToId}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedToId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {project.members?.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTask}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {creatingTask ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Invite Collaborator</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select one of your connected students to invite to this repository:
            </p>

            <select
              value={selectedInviteUser}
              onChange={(e) => setSelectedInviteUser(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">Select a connected student...</option>
              {connections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.college || 'Student'})
                </option>
              ))}
            </select>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInviteCollaborator}
                disabled={inviting || !selectedInviteUser}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {inviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
