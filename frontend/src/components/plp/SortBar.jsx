import React from 'react';
import { LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import { Select } from '../ui/Input';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'review', label: 'Avg. Customer Review' },
  { value: 'newest', label: 'Newest Arrivals' },
];

function Chip({ label, onRemove }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-caption font-medium text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
    >
      {label}
      <X className="h-3 w-3" />
    </button>
  );
}

export default function SortBar({
  sort,
  onSortChange,
  view,
  onViewChange,
  resultCount,
  activeFilters,
  onRemoveFilter,
  onOpenMobileFilters,
}) {
  const chips = [];
  if (activeFilters.minRating > 0) chips.push({ key: 'minRating', label: `${activeFilters.minRating}★ & up` });
  activeFilters.brands.forEach((brand) => chips.push({ key: 'brand', value: brand, label: brand }));
  if (activeFilters.primeOnly) chips.push({ key: 'primeOnly', label: 'Prime' });
  if (activeFilters.inStockOnly) chips.push({ key: 'inStockOnly', label: 'In Stock' });
  if (activeFilters.minDiscount > 0) chips.push({ key: 'minDiscount', label: `${activeFilters.minDiscount}%+ off` });
  if (activeFilters.priceMin != null || activeFilters.priceMax != null) chips.push({ key: 'price', label: 'Price range' });

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-small text-slate-500 dark:text-slate-400">{resultCount} results</p>

        <button
          type="button"
          onClick={onOpenMobileFilters}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-small font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>

        <div className="ml-auto flex items-center gap-3">
          <Select value={sort} onChange={(e) => onSortChange(e.target.value)} className="w-auto">
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>

          <div className="flex overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700">
            <button
              type="button"
              aria-label="Grid view"
              aria-pressed={view === 'grid'}
              onClick={() => onViewChange('grid')}
              className={`flex h-9 w-9 items-center justify-center ${
                view === 'grid' ? 'bg-brand-600 text-white' : 'bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="List view"
              aria-pressed={view === 'list'}
              onClick={() => onViewChange('list')}
              className={`flex h-9 w-9 items-center justify-center ${
                view === 'list' ? 'bg-brand-600 text-white' : 'bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <Chip key={`${chip.key}-${chip.value || i}`} label={chip.label} onRemove={() => onRemoveFilter(chip.key, chip.value)} />
          ))}
        </div>
      )}
    </div>
  );
}
