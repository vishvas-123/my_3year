import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Sparkles,
  FolderGit2,
  MessageSquare,
  Bot,
  User,
  ShieldCheck,
  LogOut,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Skill Exchange', path: '/skills', icon: Sparkles },
    { name: 'Projects & Tasks', path: '/projects', icon: FolderGit2 },
    { name: 'Real-Time Chat', path: '/chat', icon: MessageSquare },
    { name: 'AI Learning Assistant', path: '/ai', icon: Bot },
    { name: 'My Profile', path: '/profile', icon: User }
  ];

  if (isAdmin) {
    navItems.push({ name: 'Admin Console', path: '/admin', icon: ShieldCheck, badge: 'Staff' });
  }

  const completion = user?.profile?.profileCompletion || 30;

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[calc(100vh-4rem)] p-4 justify-between transition-colors">
      <div className="space-y-6">
        {/* Navigation links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Completion & Logout */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        {/* Profile Completion Card */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-700 dark:text-slate-300">Profile Completion</span>
            <span className="text-indigo-600 dark:text-indigo-400">{completion}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
          {completion < 100 && (
            <NavLink
              to="/profile"
              className="flex items-center justify-between mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              <span>Complete profile</span>
              <ChevronRight className="w-3 h-3" />
            </NavLink>
          )}
        </div>

        {/* User preview & logout */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                {user?.name?.slice(0, 2).toUpperCase() || 'U'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {user?.college || 'Student'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
