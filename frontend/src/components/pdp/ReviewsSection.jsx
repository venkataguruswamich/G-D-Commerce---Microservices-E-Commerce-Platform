import React from 'react';
import { ShieldCheck, ThumbsUp } from 'lucide-react';
import RatingStars from '../ui/RatingStars';
import { getMockReviews } from '../../utils/merchandising';
import { formatDate } from '../../utils/format';

function histogramFor(rating, reviewCount) {
  const weights = [1, 2, 3, 4, 5].map((s) => Math.max(0.02, 1 - Math.abs(rating - s) * 0.35));
  const total = weights.reduce((a, b) => a + b, 0);
  return [5, 4, 3, 2, 1].map((star) => {
    const weight = weights[star - 1];
    const pct = Math.round((weight / total) * 100);
    return { star, pct, count: Math.round((weight / total) * reviewCount) };
  });
}

/**
 * Deterministic sample reviews from utils/merchandising.js — the real
 * backend has no reviews concept, so there is deliberately no "write a
 * review" CTA here (that would imply persistence that doesn't exist).
 */
export default function ReviewsSection({ productId, rating, reviewCount, images }) {
  const reviews = getMockReviews(productId, rating);
  const histogram = histogramFor(rating, reviewCount);

  return (
    <div id="reviews" className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]">
      <div>
        <div className="mb-4 flex items-baseline gap-2">
          <span className="text-h1 font-bold text-slate-900 dark:text-white">{rating.toFixed(1)}</span>
          <span className="text-body text-slate-500 dark:text-slate-400">out of 5</span>
        </div>
        <RatingStars rating={rating} size="md" />
        <p className="mt-1 text-small text-slate-500 dark:text-slate-400">{reviewCount.toLocaleString()} global ratings</p>

        <div className="mt-6 flex flex-col gap-1.5">
          {histogram.map((row) => (
            <div key={row.star} className="flex items-center gap-2 text-caption text-slate-600 dark:text-slate-300">
              <span className="w-8 shrink-0">{row.star}★</span>
              <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <span className="block h-full rounded-full bg-amber-400" style={{ width: `${row.pct}%` }} />
              </span>
              <span className="w-9 shrink-0 text-right">{row.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {reviews.map((review, i) => (
          <div key={review.id} className="border-b border-slate-200 pb-6 last:border-0 dark:border-slate-800">
            <div className="mb-1 flex items-center gap-2">
              <RatingStars rating={review.rating} size="sm" />
              {review.verified && (
                <span className="inline-flex items-center gap-1 text-caption font-medium text-success-700 dark:text-success-600">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Purchase
                </span>
              )}
            </div>
            <h4 className="mb-1 text-small font-semibold text-slate-900 dark:text-white">{review.title}</h4>
            <p className="mb-2 text-caption text-slate-500 dark:text-slate-400">
              {review.author} &middot; {formatDate(review.date)}
            </p>
            <p className="text-small text-slate-700 dark:text-slate-300">{review.body}</p>

            {i % 2 === 0 && images?.length > 1 && (
              <div className="mt-3 flex gap-2">
                {images.slice(0, 2).map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt="Submitted by a verified customer"
                    loading="lazy"
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ))}
              </div>
            )}

            <p className="mt-3 flex items-center gap-1.5 text-caption text-slate-400 dark:text-slate-500">
              <ThumbsUp className="h-3.5 w-3.5" />
              {review.helpfulCount} people found this helpful
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
