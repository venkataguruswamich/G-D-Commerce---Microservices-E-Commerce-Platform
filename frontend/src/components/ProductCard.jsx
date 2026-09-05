import React from 'react';
import { Link } from 'react-router-dom';
import PriceDisplay from './ui/PriceDisplay';

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow duration-200 hover:shadow-elevated dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 14M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm9 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-4">
        {product.categoryName && (
          <span className="text-caption font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {product.categoryName}
          </span>
        )}
        <h3 className="line-clamp-2 text-small font-medium text-slate-900 dark:text-white">{product.name}</h3>
        <PriceDisplay cents={product.priceCents} currency={product.currency} size="sm" className="mt-1" />
      </div>
    </Link>
  );
}
