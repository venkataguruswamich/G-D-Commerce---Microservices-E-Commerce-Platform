import React from 'react';
import clsx from 'clsx';

const FIELD_CLASSES =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-body text-slate-900 placeholder:text-slate-400 ' +
  'transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ' +
  'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ' +
  'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800';

const ERROR_CLASSES = 'border-danger-600 focus:border-danger-600 focus:ring-danger-600/20';

export const Input = React.forwardRef(function Input({ className, invalid, ...props }, ref) {
  return <input ref={ref} className={clsx(FIELD_CLASSES, invalid && ERROR_CLASSES, className)} {...props} />;
});

export const Textarea = React.forwardRef(function Textarea({ className, invalid, rows = 4, ...props }, ref) {
  return (
    <textarea ref={ref} rows={rows} className={clsx(FIELD_CLASSES, invalid && ERROR_CLASSES, className)} {...props} />
  );
});

export const Select = React.forwardRef(function Select({ className, invalid, children, ...props }, ref) {
  return (
    <select ref={ref} className={clsx(FIELD_CLASSES, 'pr-8', invalid && ERROR_CLASSES, className)} {...props}>
      {children}
    </select>
  );
});

export default Input;
