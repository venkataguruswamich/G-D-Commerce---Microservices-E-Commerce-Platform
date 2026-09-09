import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Container from '../ui/Container';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../ui/Skeleton';

/**
 * Horizontal scroll-snap product rail shared by every Home.jsx section
 * (Deals of the Day, Best Sellers, Trending, Frequently Re-ordered) and PDP's
 * "Customers who bought this also bought" row.
 */
export default function ProductCarousel({ eyebrow, title, viewAllHref, products, loading, right }) {
  const scrollerRef = useRef(null);

  const scrollBy = (direction) => {
    scrollerRef.current?.scrollBy({ left: direction * 288, behavior: 'smooth' });
  };

  if (!loading && (!products || products.length === 0)) return null;

  return (
    <Container className="py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="mb-2 text-caption font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">
              {eyebrow}
            </p>
          )}
          <h2 className="text-h3 font-semibold text-slate-900 dark:text-white">{title}</h2>
        </div>
        <div className="flex items-center gap-4">
          {right}
          {viewAllHref && (
            <Link to={viewAllHref} className="text-small font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
              View all
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <SkeletonGrid count={4} />
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="absolute -left-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-soft hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 sm:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            ref={scrollerRef}
            className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:-mx-6 sm:px-6"
          >
            {products.map((product) => (
              <div key={product.id} className="w-[min(70vw,17rem)] shrink-0 snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="absolute -right-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-soft hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 sm:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </Container>
  );
}
