import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CartItem from './CartItem';
import EmptyState from './ui/EmptyState';

export default function Cart({ items, onUpdateQuantity, onRemove }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon="cart"
        title="Your cart is empty"
        description="Browse the catalog and add something you like."
        action={{ label: 'Browse Products', to: '/products' }}
      />
    );
  }

  return (
    <div>
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.div
            key={item.productId}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <CartItem item={item} onUpdateQuantity={onUpdateQuantity} onRemove={onRemove} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
