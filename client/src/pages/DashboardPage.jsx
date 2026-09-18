import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { SkillBadge, StatusBadge } from '../components/Badge';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  FolderGit2,
  Users2,
  Bot,
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  TrendingUp,
  Award,
  Loader2,
  MessageSquare
} from 'lucide-react';

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectingUserId, setConnectingUserId] = useState(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [addingGoal, setAddingGoal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [recsRes, projectsRes, userRes] = await Promise.all([
        api.get('/skills/dashboard-recommendations'),
        api.get('/projects?filter=my-projects'),
        api.get('/auth/me')
      ]);

      if (recsRes.data.success) setRecommendations(recsRes.data.recommendations);
      if (projectsRes.data.success) setProjects(projectsRes.data.projects);
      if (userRes.data.success) setGoals(userRes.data.user.learningGoals || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (receiverId) => {
    try {
      setConnectingUserId(receiverId);
      const res = await api.post('/connections/request', {
        receiverId,
        note: `Hi! I found you on SkillBridge recommendations and would love to exchange skills.`
      });

      if (res.data.success) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        setRecommendations(prev =>
          prev.map(r => r.user.id === receiverId ? { ...r, connectionStatus: 'PENDING' } : r)
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send connection request');
    } finally {
      setConnectingUserId(null);
    }
  };

  const handleToggleGoal = async (goalId) => {
    try {
      const res = await api.put(`/users/goals/${goalId}/toggle`);
      if (res.data.success) {
        setGoals(prev => prev.map(g => g.id === goalId ? res.data.goal : g));
        if (res.data.goal.isCompleted) {
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
        }
      }
    } catch (err) {
      console.error('Error toggling goal:', err);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    try {
      const res = await api.post('/users/goals', { title: newGoalTitle.trim() });
      if (res.data.success) {
        setGoals([res.data.goal, ...goals]);
        setNewGoalTitle('');
        setAddingGoal(false);
      }
    } catch (err) {
      console.error('Failed to add goal:', err);
    }
  };

  const teachSkills = user?.skills?.filter(s => s.type === 'TEACH') || [];
  const learnSkills = user?.skills?.filter(s => s.type === 'LEARN') || [];
  const completion = user?.profile?.profileCompletion || 30;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-100 border border-white/10">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            {user?.profile?.badges || 'Student Innovator'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed">
            You're currently connected with fellow students across top colleges. You can teach{' '}
            <span className="font-bold underline">{teachSkills.map(s => s.skill.name).join(', ') || 'skills'}</span> and are learning{' '}
            <span className="font-bold underline">{learnSkills.map(s => s.skill.name).join(', ') || 'new topics'}</span>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/skills"
              className="px-4 py-2 rounded-xl bg-white text-indigo-700 text-xs font-bold hover:bg-indigo-50 transition-colors shadow-sm"
            >
              Explore Skill Matches
            </Link>
            <Link
              to="/projects"
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors backdrop-blur-sm"
            >
              + Create Project
            </Link>
            <Link
              to="/ai"
              className="px-4 py-2 rounded-xl bg-purple-500/40 hover:bg-purple-500/60 text-white text-xs font-bold transition-colors border border-purple-300/30 flex items-center gap-1.5"
            >
              <Bot className="w-3.5 h-3.5" />
              Ask AI Assistant
            </Link>
          </div>
        </div>

        {/* Decorative circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>Profile Completion</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{completion}%</p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${completion}%` }} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>Skills I Teach</span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{teachSkills.length}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 truncate">
            {teachSkills.map(s => s.skill.name).join(', ') || 'None added'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>Active Projects</span>
            <FolderGit2 className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{projects.length}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            {projects.filter(p => p.status === 'IN_PROGRESS').length} in progress
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>Completed Goals</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {goals.filter(g => g.isCompleted).length} / {goals.length}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Personal milestones
          </p>
        </div>
      </div>

      {/* Main Grid: Recommended Partners & Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommended Partners (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Recommended Skill Partners
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Matched automatically by complementary teach/learn interests.
              </p>
            </div>
            <Link
              to="/skills"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all matches
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recommendations.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No partner matches yet</p>
              <p className="text-xs text-slate-500">Add more skills you know and want to learn to unlock smart matches!</p>
              <Link to="/profile" className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
                Manage My Skills
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.map((match) => {
                const partner = match.user;
                return (
                  <div
                    key={partner.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Link to={`/profile/${partner.id}`}>
                            {partner.avatar ? (
                              <img
                                src={partner.avatar}
                                alt={partner.name}
                                className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 hover:opacity-90"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                                {partner.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </Link>
                          <div>
                            <Link
                              to={`/profile/${partner.id}`}
                              className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors"
                            >
                              {partner.name}
                            </Link>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                              {partner.college || 'College Student'}
                            </p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                          {match.matchScore}% Match
                        </span>
                      </div>

                      {/* Reciprocal skill overlap highlights */}
                      <div className="text-xs space-y-1.5 pt-1">
                        {match.theyCanTeachMe.length > 0 && (
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                              Teaches
                            </span>
                            <span className="truncate font-medium">
                              {match.theyCanTeachMe.map(s => s.name).join(', ')}
                            </span>
                          </div>
                        )}
                        {match.iCanTeachThem.length > 0 && (
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                              Learns
                            </span>
                            <span className="truncate font-medium">
                              {match.iCanTeachThem.map(s => s.name).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Connect button */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <Link
                        to={`/profile/${partner.id}`}
                        className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      >
                        View Profile
                      </Link>

                      {match.connectionStatus === 'ACCEPTED' ? (
                        <Link
                          to={`/chat?userId=${partner.id}`}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Chat
                        </Link>
                      ) : match.connectionStatus === 'PENDING' ? (
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                          Request Pending
                        </span>
                      ) : (
                        <button
                          onClick={() => handleConnect(partner.id)}
                          disabled={connectingUserId === partner.id}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {connectingUserId === partner.id ? 'Sending...' : 'Connect'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Learning Goals & Active Projects */}
        <div className="space-y-8">
          {/* Learning Goals Widget */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                My Learning Goals
              </h3>
              <button
                onClick={() => setAddingGoal(!addingGoal)}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {addingGoal ? 'Cancel' : '+ New Goal'}
              </button>
            </div>

            {addingGoal && (
              <form onSubmit={handleAddGoal} className="flex gap-2">
                <input
                  type="text"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="e.g. Master React Hooks"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                >
                  Save
                </button>
              </form>
            )}

            <div className="space-y-2">
              {goals.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No learning goals set yet.</p>
              ) : (
                goals.slice(0, 5).map((g) => (
                  <div
                    key={g.id}
                    onClick={() => handleToggleGoal(g.id)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                  >
                    {g.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                    )}
                    <span
                      className={`text-xs font-medium truncate ${
                        g.isCompleted
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {g.title}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Projects Mini Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Collaborative Projects
              </h3>
              <Link to="/projects" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {projects.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No projects joined yet.</p>
              ) : (
                projects.slice(0, 3).map((p) => (
                  <Link
                    key={p.id}
                    to={`/projects/${p.id}`}
                    className="block p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                        {p.title}
                      </h4>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mb-2">
                      {p.techStack}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>Progress</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{p.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
