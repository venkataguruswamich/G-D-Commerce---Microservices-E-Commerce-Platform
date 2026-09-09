import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Slide-in sibling of Modal.jsx (same focus-trap/Escape/backdrop pattern),
// used for the cart/category mega-menu on desktop and the filter sheet on
// mobile — anywhere a full centered dialog would feel too heavy.
const VARIANTS = {
  right: {
    panelClass: 'inset-y-0 right-0 h-full w-full max-w-md',
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
  },
  left: {
    panelClass: 'inset-y-0 left-0 h-full w-full max-w-md',
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
  },
  bottom: {
    panelClass: 'inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-2xl',
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
  },
};

export default function Drawer({ isOpen, onClose, side = 'right', title, children, footer }) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    previouslyFocused.current = document.activeElement;
    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll(FOCUSABLE_SELECTOR);
    (focusable?.[0] || panel)?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;

      const nodes = Array.from(panel.querySelectorAll(FOCUSABLE_SELECTOR));
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, onClose]);

  const variant = VARIANTS[side] || VARIANTS.right;

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment key="drawer">
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions -- mouse-only dismiss convenience layered on top of the keyboard-accessible dialog below (Escape + focus trap + visible Close button) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm"
            onMouseDown={onClose}
          />
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- stops the backdrop's dismiss handler firing for clicks inside the panel */}
          <motion.div
            ref={panelRef}
            initial={variant.initial}
            animate={variant.animate}
            exit={variant.exit}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className={`fixed z-[101] flex flex-col border-slate-200 bg-white shadow-elevated outline-none dark:border-slate-800 dark:bg-slate-900 ${variant.panelClass}`}
          >
            {title && (
              <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                <h3 className="text-h4 font-semibold text-slate-900 dark:text-white">{title}</h3>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {footer && <div className="shrink-0 border-t border-slate-200 px-5 py-4 dark:border-slate-800">{footer}</div>}
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
