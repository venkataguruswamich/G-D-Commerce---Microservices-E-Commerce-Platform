import React from 'react';
import { Link } from 'react-router-dom';
import PriceDisplay from './ui/PriceDisplay';
import QuantityStepper from './ui/QuantityStepper';
import { formatMoney } from '../utils/format';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <div className="flex items-center gap-4 border-b border-slate-200 py-4 last:border-b-0 dark:border-slate-800">
      <Link to={`/products/${item.productId}`} className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 14M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
            </svg>
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          to={`/products/${item.productId}`}
          className="line-clamp-1 text-small font-medium text-slate-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
        >
          {item.name}
        </Link>
        <span className="mt-1 block text-small text-slate-500 dark:text-slate-400">{formatMoney(item.priceCents)}</span>
      </div>

      <QuantityStepper size="sm" value={item.quantity} onChange={(q) => onUpdateQuantity(item.productId, q)} />

      <PriceDisplay cents={item.priceCents * item.quantity} size="sm" className="w-20 shrink-0 text-right" />

      <button
        type="button"
        onClick={() => onRemove(item.productId)}
        aria-label={`Remove ${item.name} from cart`}
        className="shrink-0 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-danger-600 dark:hover:bg-slate-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6m-9 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0h12" />
        </svg>
      </button>
    </div>
  );
}
