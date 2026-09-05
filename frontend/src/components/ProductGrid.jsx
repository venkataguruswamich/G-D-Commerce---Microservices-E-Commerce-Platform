import React from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import EmptyState from './ui/EmptyState';

const GRID_VARIANTS = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const CARD_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export default function ProductGrid({ products }) {
  if (!products || products.length === 0) {
    return <EmptyState icon="search" title="No products found" description="Try a different search term or category." />;
  }

  return (
    <motion.div
      variants={GRID_VARIANTS}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={CARD_VARIANTS} transition={{ duration: 0.25, ease: 'easeOut' }}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}
