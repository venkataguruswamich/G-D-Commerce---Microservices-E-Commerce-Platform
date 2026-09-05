import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const VARIANT_CLASSES = {
  primary: 'bg-brand-600 text-white shadow-soft hover:bg-brand-700 focus-visible:ring-brand-500',
  secondary:
    'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 focus-visible:ring-brand-500',
  ghost:
    'bg-transparent text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 focus-visible:ring-brand-500',
  danger: 'bg-danger-600 text-white shadow-soft hover:bg-danger-700 focus-visible:ring-danger-600',
};

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

const MotionLink = motion(Link);

// Subtle press feedback only — no hover scale/lift/glow. Motion should
// confirm a tap happened, not perform.
const TAP_ANIMATION = { scale: 0.98 };
const TAP_TRANSITION = { duration: 0.1, ease: 'easeOut' };

/**
 * Shared button primitive: consistent padding/radius/focus-ring across the
 * app, plus a small tap micro-interaction. Renders a react-router `Link`
 * when `to` is given, otherwise a real `<button>` — the caller's `type`,
 * `onClick`, `disabled`, etc. all pass through untouched.
 */
export default function Button({ to, variant = 'primary', size = 'md', className, children, disabled, ...props }) {
  const classes = clsx(
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-tight',
    'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'dark:focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className
  );

  const motionProps = disabled ? {} : { whileTap: TAP_ANIMATION, transition: TAP_TRANSITION };

  if (to) {
    return (
      <MotionLink to={to} className={classes} {...motionProps} {...props}>
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.button className={classes} disabled={disabled} {...motionProps} {...props}>
      {children}
    </motion.button>
  );
}
