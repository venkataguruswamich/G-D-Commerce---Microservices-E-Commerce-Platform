import React from 'react';
import clsx from 'clsx';

/**
 * Solid surface primitive for cards/panels. Deliberately opaque (no
 * translucency/blur) — the sticky nav is the app's one glass effect;
 * everything else reads as a flat, high-contrast surface.
 */
export default function Card({ as: Tag = 'div', padding = 'md', className, children, ...props }) {
  const paddingClass = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' }[padding];

  return (
    <Tag
      className={clsx(
        'rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900',
        paddingClass,
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
