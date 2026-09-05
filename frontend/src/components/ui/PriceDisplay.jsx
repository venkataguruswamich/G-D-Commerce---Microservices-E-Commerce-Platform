import React from 'react';
import clsx from 'clsx';
import { formatMoney } from '../../utils/format';

const SIZE_CLASSES = {
  sm: 'text-small font-semibold',
  md: 'text-h4 font-semibold',
  lg: 'text-h2 font-bold',
};

export default function PriceDisplay({ cents, currency = 'USD', size = 'md', className }) {
  return (
    <span className={clsx(SIZE_CLASSES[size], 'text-slate-900 dark:text-white', className)}>
      {formatMoney(cents, currency)}
    </span>
  );
}
