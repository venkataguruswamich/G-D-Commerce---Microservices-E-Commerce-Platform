import React from 'react';

const TONE_CLASSES = {
  success: 'border-l-success-600',
  error: 'border-l-danger-600',
  warning: 'border-l-warning-600',
  info: 'border-l-brand-600',
};

const ICON_PATHS = {
  success: 'M5 13l4 4L19 7',
  error: 'M6 18 18 6M6 6l12 12',
  warning: 'M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z',
  info: 'M12 16v-4m0-4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
};

export default function Notification({ type = 'info', children, onDismiss }) {
  return (
    <div
      role="alert"
      className={`flex w-80 items-start gap-3 rounded-lg border-l-4 bg-white px-4 py-3 shadow-elevated dark:bg-slate-800 ${TONE_CLASSES[type] || TONE_CLASSES.info}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[type] || ICON_PATHS.info} />
      </svg>
      <span className="flex-1 text-small text-slate-700 dark:text-slate-200">{children}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
