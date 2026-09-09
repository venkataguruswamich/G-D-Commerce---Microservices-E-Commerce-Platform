import React from 'react';
import clsx from 'clsx';
import { formatMoney } from '../../utils/format';

const SIZE_CLASSES = {
  sm: 'text-small font-semibold',
  md: 'text-h4 font-semibold',
  lg: 'text-h2 font-bold',
};

const MRP_SIZE_CLASSES = {
  sm: 'text-caption',
  md: 'text-small',
  lg: 'text-body',
};

export default function PriceDisplay({ cents, currency = 'USD', size = 'md', className, mrpCents, discountPercent }) {
  const hasSavings = Boolean(mrpCents && discountPercent && mrpCents > cents);

  if (!hasSavings) {
    return (
      <span className={clsx(SIZE_CLASSES[size], 'text-slate-900 dark:text-white', className)}>
        {formatMoney(cents, currency)}
      </span>
    );
  }

  const savingsCents = mrpCents - cents;

  return (
    <span className={clsx('flex flex-wrap items-baseline gap-2', className)}>
      <span className={clsx(SIZE_CLASSES[size], 'text-slate-900 dark:text-white')}>{formatMoney(cents, currency)}</span>
      <span className={clsx(MRP_SIZE_CLASSES[size], 'text-slate-400 line-through dark:text-slate-500')}>
        {formatMoney(mrpCents, currency)}
      </span>
      <span className="text-caption font-medium text-success-700 dark:text-success-600">
        Save {discountPercent}% ({formatMoney(savingsCents, currency)})
      </span>
    </span>
  );
}
