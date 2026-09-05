import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import ErrorMessage from '../components/ErrorMessage';
import Container from '../components/ui/Container';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Pagination from '../components/ui/Pagination';
import { Input, Select } from '../components/ui/Input';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { listProducts } from '../api/products';
import { listCategories } from '../api/categories';
import { extractErrorMessage } from '../utils/errors';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 12;

  useEffect(() => {
    listCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    listProducts({ search, categoryId: categoryId || undefined, sort, page, limit })
      .then((data) => {
        setProducts(data.items);
        setTotal(data.total);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [search, categoryId, sort, page]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const updatePage = (nextPage) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(nextPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const activeCategory = categories.find((c) => c.id === categoryId);
  const hasActiveFilters = Boolean(search || categoryId);

  useDocumentTitle(activeCategory ? activeCategory.name : 'Products');

  return (
    <Container className="py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: activeCategory ? activeCategory.name : 'Products' }]} />

      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-h2 font-semibold text-slate-900 dark:text-white">{activeCategory ? activeCategory.name : 'All Products'}</h1>
        {!loading && !error && <p className="text-small text-slate-500 dark:text-slate-400">{total} products</p>}
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="search"
          placeholder="Search products..."
          defaultValue={search}
          className="sm:max-w-xs"
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateFilter('search', e.target.value);
          }}
        />
        <Select value={categoryId} onChange={(e) => updateFilter('categoryId', e.target.value)} className="sm:max-w-[12rem]">
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select value={sort} onChange={(e) => updateFilter('sort', e.target.value)} className="sm:max-w-[12rem]">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A-Z</option>
          <option value="name_desc">Name: Z-A</option>
        </Select>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-small font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 sm:ml-auto"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading && <SkeletonGrid count={limit} />}
      <ErrorMessage message={error} />
      {!loading && !error && (
        <>
          <ProductGrid products={products} />
          <Pagination page={page} totalPages={totalPages} onChange={updatePage} />
        </>
      )}
    </Container>
  );
}
