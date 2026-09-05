import React from 'react';
import clsx from 'clsx';

const TONE_CLASSES = {
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400',
  success: 'bg-success-100 text-success-700 dark:bg-success-600/20 dark:text-success-600',
  warning: 'bg-warning-100 text-warning-700 dark:bg-warning-600/20 dark:text-warning-600',
  danger: 'bg-danger-100 text-danger-700 dark:bg-danger-600/20 dark:text-danger-600',
  info: 'bg-info-100 text-info-700 dark:bg-info-600/20 dark:text-info-600',
};

// Order/payment statuses map to a fixed tone so meaning stays consistent
// wherever a status is shown (list, detail, admin table).
const STATUS_TONE = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'info',
  SHIPPED: 'brand',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  SUCCESS: 'success',
  FAILED: 'danger',
  REFUNDED: 'neutral',
};

export default function Badge({ tone = 'neutral', status, children, className }) {
  const resolvedTone = status ? STATUS_TONE[status] || 'neutral' : tone;
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium',
        TONE_CLASSES[resolvedTone],
        className
      )}
    >
      {children ?? status}
    </span>
  );
}
