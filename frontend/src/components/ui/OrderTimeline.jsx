import React from 'react';
import clsx from 'clsx';

// Mirrors the `orders.status` CHECK constraint in the database exactly —
// nothing here implies a status the backend can't actually reach.
const STEPS = [
  { key: 'PENDING', label: 'Order placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
];

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3.5 w-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
  </svg>
);

export default function OrderTimeline({ status }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-danger-50 px-4 py-3 text-small font-medium text-danger-700 dark:bg-danger-600/10 dark:text-danger-600">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <ol className="flex w-full items-start" aria-label="Order status">
      {STEPS.map((step, i) => {
        const isComplete = i < currentIndex || (i === currentIndex && i === STEPS.length - 1);
        const isCurrent = i === currentIndex && i !== STEPS.length - 1;
        const isDone = i <= currentIndex;

        return (
          <li key={step.key} className="flex flex-1 flex-col items-center text-center last:flex-none">
            <div className="flex w-full items-center">
              <div
                className={clsx(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-white',
                  isDone ? 'border-brand-600 bg-brand-600' : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900'
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isComplete && <CheckIcon />}
              </div>
              {i < STEPS.length - 1 && (
                <div className={clsx('h-0.5 flex-1', i < currentIndex ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700')} />
              )}
            </div>
            <span
              className={clsx(
                'mt-2 max-w-[5.5rem] text-caption font-medium',
                isDone ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
