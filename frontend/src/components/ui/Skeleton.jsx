import React from 'react';
import clsx from 'clsx';

/**
 * Base shimmer block. Composed into SkeletonText/SkeletonCard/SkeletonGrid
 * below; used directly for one-off shapes (e.g. an avatar circle).
 */
export function Skeleton({ className, rounded = 'rounded-lg' }) {
  return <div className={clsx('skeleton', rounded, className)} aria-hidden="true" />;
}

export function SkeletonText({ lines = 1, className }) {
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Skeleton key={i} className={clsx('h-4', i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/60 p-4 dark:border-slate-700/60">
      <Skeleton className="h-40 w-full" rounded="rounded-xl" />
      <SkeletonText lines={2} />
      <Skeleton className="h-5 w-1/3" />
    </div>
  );
}

export function SkeletonGrid({ count = 8, className }) {
  return (
    <div className={clsx('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4', className)} role="status" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
