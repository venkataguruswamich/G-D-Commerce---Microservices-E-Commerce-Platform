import React from 'react';
import Button from './Button';

const ICON_PATHS = {
  cart: 'M3 3h2l.4 2M7 13h10l3-8H6.4M7 13 5.4 5M7 13l-2.29 2.29A1 1 0 0 0 5.41 17H17M17 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM9 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  search: 'M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z',
  orders: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 8h6m-6 4h6',
  inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z',
  box: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Zm-9 13V12M21 7.5 12 12 3 7.5',
};

/**
 * `action`: optional { label, to } (link) or { label, onClick } (button).
 */
export default function EmptyState({ icon = 'box', title, description, action }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-7 w-7">
          <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[icon] || ICON_PATHS.box} />
        </svg>
      </div>
      <h3 className="text-h4 font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description && <p className="max-w-sm text-small text-slate-500 dark:text-slate-400">{description}</p>}
      {action && (
        <Button to={action.to} onClick={action.onClick} size="sm" className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  );
}
