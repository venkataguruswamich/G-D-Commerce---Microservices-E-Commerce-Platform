import React from 'react';

export default function FormField({ label, id, error, hint, children }) {
  return (
    <div className="mb-4 flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      {children}
      {hint && !error && <span className="text-caption text-slate-500 dark:text-slate-400">{hint}</span>}
      {error && (
        <span className="text-caption font-medium text-danger-600" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
