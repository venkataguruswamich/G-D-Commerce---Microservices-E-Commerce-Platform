import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Shared -/qty/+ control for cart rows and the PDP quantity picker.
 * `max` is optional (PDP has no known stock ceiling from the product API).
 */
export default function QuantityStepper({ value, onChange, min = 1, max, size = 'md' }) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(max ? Math.min(max, value + 1) : value + 1);

  const sizeClasses = size === 'sm' ? 'h-8 w-8 text-sm' : 'h-9 w-9 text-base';

  return (
    <div
      className="inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-700"
      role="group"
      aria-label="Quantity"
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={`flex items-center justify-center rounded-l-lg text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800 ${sizeClasses}`}
      >
        &minus;
      </button>
      <span className="relative inline-block min-w-[2rem] overflow-hidden text-center align-middle text-small font-medium text-slate-900 dark:text-slate-100" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="block"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={max != null && value >= max}
        aria-label="Increase quantity"
        className={`flex items-center justify-center rounded-r-lg text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800 ${sizeClasses}`}
      >
        +
      </button>
    </div>
  );
}
