import React from 'react';

export function SkillBadge({ name, level, type, onRemove }) {
  const isTeach = type === 'TEACH';
  
  const levelColors = {
    BEGINNER: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    INTERMEDIATE: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    ADVANCED: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    EXPERT: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${levelColors[level] || levelColors.INTERMEDIATE}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isTeach ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
      <span>{name}</span>
      {level && <span className="opacity-60 text-[10px] uppercase font-semibold">({level.slice(0, 3)})</span>}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 hover:text-red-500 transition-colors cursor-pointer"
        >
          &times;
        </button>
      )}
    </span>
  );
}

export function StatusBadge({ status }) {
  const statusConfig = {
    PLANNING: { label: 'Planning', bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
    IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' },
    COMPLETED: { label: 'Completed', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
    TODO: { label: 'To Do', bg: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
    DONE: { label: 'Done', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
    PENDING: { label: 'Pending', bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
    ACCEPTED: { label: 'Accepted', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
    ACTIVE: { label: 'Active', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
    SUSPENDED: { label: 'Suspended', bg: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800' }
  };

  const current = statusConfig[status] || { label: status, bg: 'bg-gray-100 text-gray-700 border-gray-200' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.bg}`}>
      {current.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const configs = {
    LOW: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
    MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
    HIGH: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${configs[priority] || configs.MEDIUM}`}>
      {priority}
    </span>
  );
}
