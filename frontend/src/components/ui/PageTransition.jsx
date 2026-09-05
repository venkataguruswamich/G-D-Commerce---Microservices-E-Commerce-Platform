import React from 'react';
import { motion } from 'framer-motion';

const VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const TRANSITION = { duration: 0.25, ease: [0.4, 0, 0.2, 1] };

/**
 * Wraps a route's content for the AnimatePresence-driven page transition in
 * App.jsx. Kept as its own component (rather than inlining the motion.div in
 * App.jsx) so the animation curve/timing lives in exactly one place.
 */
export default function PageTransition({ children }) {
  return (
    <motion.div variants={VARIANTS} initial="initial" animate="animate" exit="exit" transition={TRANSITION}>
      {children}
    </motion.div>
  );
}
