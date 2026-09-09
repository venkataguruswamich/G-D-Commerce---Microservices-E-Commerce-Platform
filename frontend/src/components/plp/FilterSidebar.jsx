import React from 'react';
import Drawer from '../ui/Drawer';
import Button from '../ui/Button';
import { formatMoney } from '../../utils/format';

const RATING_OPTIONS = [4, 3, 2];
const DISCOUNT_OPTIONS = [10, 25, 30];

export const DEFAULT_FILTERS = {
  priceMin: null,
  priceMax: null,
  minRating: 0,
  brands: [],
  primeOnly: false,
  inStockOnly: false,
  minDiscount: 0,
};

export function hasActiveFilters(filters) {
  return (
    filters.priceMin != null ||
    filters.priceMax != null ||
    filters.minRating > 0 ||
    filters.brands.length > 0 ||
    filters.primeOnly ||
    filters.inStockOnly ||
    filters.minDiscount > 0
  );
}

function SectionHeading({ children }) {
  return <h3 className="mb-3 text-small font-semibold text-slate-900 dark:text-white">{children}</h3>;
}

function CheckboxRow({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1 text-small text-slate-600 dark:text-slate-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800"
      />
      {label}
    </label>
  );
}

function FilterContent({ filters, onChange, facets }) {
  const toggleBrand = (brand) => {
    const brands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onChange({ brands });
  };

  const toggleRating = (value) => {
    onChange({ minRating: filters.minRating === value ? 0 : value });
  };

  const toggleDiscount = (value) => {
    onChange({ minDiscount: filters.minDiscount === value ? 0 : value });
  };

  const { min = 0, max = 100000 } = facets.priceBounds || {};

  return (
    <div className="flex flex-col gap-6">
      {hasActiveFilters(filters) && (
        <button
          type="button"
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="self-start text-small font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
        >
          Clear all filters
        </button>
      )}

      <div>
        <SectionHeading>Price</SectionHeading>
        <p className="mb-2 text-caption text-slate-500 dark:text-slate-400">
          {formatMoney(filters.priceMin ?? min)} &ndash; {formatMoney(filters.priceMax ?? max)}
        </p>
        <input
          type="range"
          min={min}
          max={max}
          value={filters.priceMin ?? min}
          onChange={(e) => onChange({ priceMin: Number(e.target.value) })}
          className="w-full accent-brand-600"
          aria-label="Minimum price"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={filters.priceMax ?? max}
          onChange={(e) => onChange({ priceMax: Number(e.target.value) })}
          className="w-full accent-brand-600"
          aria-label="Maximum price"
        />
      </div>

      <div>
        <SectionHeading>Customer Rating</SectionHeading>
        {RATING_OPTIONS.map((value) => (
          <CheckboxRow
            key={value}
            checked={filters.minRating === value}
            onChange={() => toggleRating(value)}
            label={`${value}★ & up`}
          />
        ))}
      </div>

      {facets.availableBrands?.length > 0 && (
        <div>
          <SectionHeading>Brand</SectionHeading>
          {facets.availableBrands.map((brand) => (
            <CheckboxRow key={brand} checked={filters.brands.includes(brand)} onChange={() => toggleBrand(brand)} label={brand} />
          ))}
        </div>
      )}

      <div>
        <SectionHeading>Delivery</SectionHeading>
        <CheckboxRow
          checked={filters.primeOnly}
          onChange={() => onChange({ primeOnly: !filters.primeOnly })}
          label="Prime / Express delivery"
        />
        <CheckboxRow
          checked={filters.inStockOnly}
          onChange={() => onChange({ inStockOnly: !filters.inStockOnly })}
          label="In Stock only"
        />
      </div>

      <div>
        <SectionHeading>Discount</SectionHeading>
        {DISCOUNT_OPTIONS.map((value) => (
          <CheckboxRow
            key={value}
            checked={filters.minDiscount === value}
            onChange={() => toggleDiscount(value)}
            label={`${value}% off or more`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Desktop: always-visible sticky column. Mobile: same content inside a
 * bottom-sheet Drawer, opened via `isOpen`/closed via `onClose`.
 */
export default function FilterSidebar({ filters, onChange, facets, isOpen, onClose }) {
  return (
    <>
      <aside className="hidden lg:sticky lg:top-24 lg:block lg:h-fit">
        <FilterContent filters={filters} onChange={onChange} facets={facets} />
      </aside>

      <div className="lg:hidden">
        <Drawer
          isOpen={isOpen}
          onClose={onClose}
          side="bottom"
          title="Filters"
          footer={
            <Button onClick={onClose} className="w-full">
              Show results
            </Button>
          }
        >
          <FilterContent filters={filters} onChange={onChange} facets={facets} />
        </Drawer>
      </div>
    </>
  );
}
