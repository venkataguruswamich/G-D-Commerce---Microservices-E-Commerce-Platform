import React from 'react';
import clsx from 'clsx';

const SIZE_CLASSES = {
  narrow: 'max-w-3xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
  full: 'max-w-none',
};

/**
 * Layout primitive replacing the old blanket `.app-content` max-width.
 * Lets a section opt into full-bleed (e.g. a hero background) while its
 * inner content still gets the standard horizontal padding and an optional
 * max-width constraint.
 */
export default function Container({ as: Tag = 'div', size = 'default', className, children, ...props }) {
  return (
    <Tag className={clsx('mx-auto w-full px-4 sm:px-6 lg:px-8', SIZE_CLASSES[size], className)} {...props}>
      {children}
    </Tag>
  );
}
