import React from 'react';
import { Link } from 'react-router-dom';

/**
 * `items`: [{ label, to }] — the last item renders as plain text (current page).
 */
export default function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-small text-slate-500 dark:text-slate-400">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">/</span>}
              {isLast || !item.to ? (
                <span aria-current={isLast ? 'page' : undefined} className="text-slate-700 dark:text-slate-200">
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="hover:text-brand-600 dark:hover:text-brand-400">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
