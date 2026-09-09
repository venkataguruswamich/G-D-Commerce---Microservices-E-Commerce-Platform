import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import ErrorMessage from '../components/ErrorMessage';
import Container from '../components/ui/Container';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Pagination from '../components/ui/Pagination';
import { Input, Select } from '../components/ui/Input';
import { SkeletonGrid } from '../components/ui/Skeleton';
import FilterSidebar, { DEFAULT_FILTERS, hasActiveFilters } from '../components/plp/FilterSidebar';
import SortBar from '../components/plp/SortBar';
import { getStorefrontProducts, getStorefrontCategories } from '../utils/catalog';
import { listInventory } from '../api/products';
import { getMerchandising } from '../utils/merchandising';
import { extractErrorMessage } from '../utils/errors';
import useDocumentTitle from '../hooks/useDocumentTitle';

const SERVER_SORTS = new Set(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'newest']);
const PAGE_SIZE = 12;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [workingSet, setWorkingSet] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [view, setView] = useState('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const sort = searchParams.get('sort') || 'featured';
  const serverSort = SERVER_SORTS.has(sort) ? sort : 'newest';

  useEffect(() => {
    getStorefrontCategories().then(setCategories).catch(() => {});
    listInventory({ limit: 100 })
      .then((data) => {
        const map = {};
        (data.items || []).forEach((row) => {
          map[row.productId] = { quantity: row.quantity, reserved: row.reserved };
        });
        setInventory(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setPage(1);
    getStorefrontProducts({ search, categoryId: categoryId || undefined, sort: serverSort, limit: 60, page: 1 })
      .then((data) => setWorkingSet(data.items))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [search, categoryId, serverSort]);

  const merchByProduct = useMemo(() => {
    const map = new Map();
    workingSet.forEach((product) => map.set(product.id, getMerchandising(product, { inventory })));
    return map;
  }, [workingSet, inventory]);

  const facets = useMemo(() => {
    const brands = new Set();
    let min = Infinity;
    let max = 0;
    workingSet.forEach((product) => {
      brands.add(merchByProduct.get(product.id).brand);
      min = Math.min(min, product.priceCents);
      max = Math.max(max, product.priceCents);
    });
    return {
      availableBrands: [...brands].sort(),
      priceBounds: workingSet.length ? { min, max } : { min: 0, max: 100000 },
    };
  }, [workingSet, merchByProduct]);

  const filteredSorted = useMemo(() => {
    let items = workingSet.filter((product) => {
      const merch = merchByProduct.get(product.id);
      if (filters.priceMin != null && product.priceCents < filters.priceMin) return false;
      if (filters.priceMax != null && product.priceCents > filters.priceMax) return false;
      if (filters.minRating > 0 && merch.rating < filters.minRating) return false;
      if (filters.brands.length > 0 && !filters.brands.includes(merch.brand)) return false;
      if (filters.primeOnly && !merch.isPrimeEligible) return false;
      if (filters.inStockOnly && !merch.inStock) return false;
      if (filters.minDiscount > 0 && merch.discountPercent < filters.minDiscount) return false;
      return true;
    });

    if (sort === 'review') {
      items = [...items].sort((a, b) => merchByProduct.get(b.id).rating - merchByProduct.get(a.id).rating);
    }
    // 'featured' keeps server order (newest-first fetch); real server sorts
    // (price_asc/desc/name_asc/desc/newest) are already applied by the API.

    return items;
  }, [workingSet, merchByProduct, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const pagedItems = filteredSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateServerParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const removeFilterChip = (key, value) => {
    if (key === 'brand') {
      setFilters((prev) => ({ ...prev, brands: prev.brands.filter((b) => b !== value) }));
    } else if (key === 'price') {
      setFilters((prev) => ({ ...prev, priceMin: null, priceMax: null }));
    } else if (key === 'minRating') {
      setFilters((prev) => ({ ...prev, minRating: 0 }));
    } else if (key === 'minDiscount') {
      setFilters((prev) => ({ ...prev, minDiscount: 0 }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: false }));
    }
    setPage(1);
  };

  const patchFilters = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const clearAll = () => {
    setSearchParams(new URLSearchParams());
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const activeCategory = categories.find((c) => c.id === categoryId);
  const anyFilterActive = Boolean(search || categoryId) || hasActiveFilters(filters);

  useDocumentTitle(activeCategory ? activeCategory.name : 'Products');

  return (
    <Container className="py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: activeCategory ? activeCategory.name : 'Products' }]} />

      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-h2 font-semibold text-slate-900 dark:text-white">{activeCategory ? activeCategory.name : 'All Products'}</h1>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="search"
          placeholder="Search products..."
          defaultValue={search}
          className="sm:max-w-xs"
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateServerParam('search', e.target.value);
          }}
        />
        <Select value={categoryId} onChange={(e) => updateServerParam('categoryId', e.target.value)} className="sm:max-w-[12rem]">
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        {anyFilterActive && (
          <button
            type="button"
            onClick={clearAll}
            className="text-small font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 sm:ml-auto"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading && <SkeletonGrid count={PAGE_SIZE} />}
      <ErrorMessage message={error} />
      {!loading && !error && (
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
          <FilterSidebar
            filters={filters}
            onChange={patchFilters}
            facets={facets}
            isOpen={mobileFiltersOpen}
            onClose={() => setMobileFiltersOpen(false)}
          />
          <div>
            <SortBar
              sort={sort}
              onSortChange={(value) => updateServerParam('sort', value)}
              view={view}
              onViewChange={setView}
              resultCount={filteredSorted.length}
              activeFilters={filters}
              onRemoveFilter={removeFilterChip}
              onOpenMobileFilters={() => setMobileFiltersOpen(true)}
            />
            <ProductGrid products={pagedItems} view={view} />
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </div>
      )}
    </Container>
  );
}
