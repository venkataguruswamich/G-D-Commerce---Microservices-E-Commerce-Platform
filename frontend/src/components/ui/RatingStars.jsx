import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import clsx from 'clsx';

const SIZE_CLASSES = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4.5 w-4.5',
};

function StarIcon({ fill, sizeClass }) {
  return (
    <span className={clsx('relative inline-block', sizeClass)}>
      <Star className={clsx('absolute inset-0 text-slate-300 dark:text-slate-600', sizeClass)} />
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
        <Star className={clsx('fill-amber-400 text-amber-400', sizeClass)} />
      </span>
    </span>
  );
}

/**
 * `rating`/`reviewCount` are presentation-layer values from
 * utils/merchandising.js — the real backend has no ratings/reviews concept.
 */
export default function RatingStars({ rating = 0, reviewCount, size = 'sm', href }) {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.sm;

  const stars = (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        // eslint-disable-next-line react/no-array-index-key
        return <StarIcon key={i} fill={fill} sizeClass={sizeClass} />;
      })}
    </span>
  );

  const content = (
    <>
      {stars}
      <span className="sr-only">{rating.toFixed(1)} out of 5 stars</span>
      {reviewCount != null && (
        <span className="text-caption text-slate-500 dark:text-slate-400">({reviewCount.toLocaleString()})</span>
      )}
    </>
  );

  if (href) {
    return (
      <Link to={href} className="inline-flex items-center gap-1.5 hover:opacity-80">
        {content}
      </Link>
    );
  }

  return <div className="inline-flex items-center gap-1.5">{content}</div>;
}
