import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/Badge';
import {
  ShieldCheck,
  Users,
  FolderGit2,
  MessageSquare,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  AlertTriangle,
  Loader2
} from 'lucide-react';

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'projects'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, projectsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/projects')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (usersRes.data.success) setUsersList(usersRes.data.users);
      if (projectsRes.data.success) setProjectsList(projectsRes.data.projects);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (targetUser) => {
    const newStatus = targetUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!window.confirm(`Are you sure you want to change status to ${newStatus} for ${targetUser.name}?`)) return;

    try {
      const res = await api.put(`/admin/users/${targetUser.id}/status`, { status: newStatus });
      if (res.data.success) {
        setUsersList(prev => prev.map(u => u.id === targetUser.id ? { ...u, status: newStatus } : u));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'STUDENT' ? 'ADMIN' : 'STUDENT';
    if (!window.confirm(`Change role to ${newRole} for ${targetUser.name}?`)) return;

    try {
      const res = await api.put(`/admin/users/${targetUser.id}/role`, { role: newRole });
      if (res.data.success) {
        setUsersList(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This cannot be undone.')) return;

    try {
      const res = await api.delete(`/admin/projects/${projectId}`);
      if (res.data.success) {
        setProjectsList(prev => prev.filter(p => p.id !== projectId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-12 text-center text-slate-500">
        Access Denied. Administrator privileges are required to view this page.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const filteredUsers = usersList.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.college && u.college.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Admin Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <ShieldCheck className="w-8 h-8 text-amber-500" />
          SkillBridge Administration Console
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor platform metrics, moderate project content, and manage student accounts.
        </p>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
              <span>Total Students</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</p>
            <p className="text-[11px] text-slate-400 mt-1">{stats.studentUsers} Active learners</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
              <span>Total Projects</span>
              <FolderGit2 className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalProjects}</p>
            <p className="text-[11px] text-slate-400 mt-1">{stats.activeProjects} in active development</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
              <span>Skill Connections</span>
              <Sparkles className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.acceptedConnections}</p>
            <p className="text-[11px] text-slate-400 mt-1">{stats.totalConnections} total initiated</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
              <span>Real-Time Messages</span>
              <MessageSquare className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalMessages}</p>
            <p className="text-[11px] text-slate-400 mt-1">{stats.totalTasks} tasks tracked</p>
          </div>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Registered Users ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            All Projects ({projectsList.length})
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, college..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Tab 1: User Management Table */}
      {activeTab === 'users' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Student / User</th>
                  <th className="px-6 py-3.5">College Affiliation</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Joined</th>
                  <th className="px-6 py-3.5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="truncate block max-w-[180px]">{u.college || '—'}</span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={u.status} />
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      {u.id !== user?.id && (
                        <>
                          <button
                            onClick={() => handleToggleRole(u)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold cursor-pointer"
                          >
                            {u.role === 'STUDENT' ? 'Make Admin' : 'Demote'}
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                              u.status === 'ACTIVE'
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Project Moderation Table */}
      {activeTab === 'projects' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Project Title</th>
                  <th className="px-6 py-3.5">Owner</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Members & Tasks</th>
                  <th className="px-6 py-3.5">Created</th>
                  <th className="px-6 py-3.5 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {projectsList.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{p.title}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{p.techStack}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900 dark:text-white">{p.owner?.name}</p>
                      <p className="text-[11px] text-slate-400">{p.owner?.college || 'Student'}</p>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={p.status} />
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {p._count?.members || 1} members &bull; {p._count?.tasks || 0} tasks
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteProject(p.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Remove project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
