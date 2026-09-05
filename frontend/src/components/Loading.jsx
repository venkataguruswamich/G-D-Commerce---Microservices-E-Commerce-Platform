import React from 'react';

export default function Loading({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-small text-slate-500 dark:text-slate-400" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600 dark:border-slate-700 dark:border-t-brand-500" />
      <span>{label}</span>
    </div>
  );
}
