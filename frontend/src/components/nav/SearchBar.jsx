import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { getStorefrontCategories, getStorefrontProducts } from '../../utils/catalog';
import { formatMoney } from '../../utils/format';

export default function SearchBar({ className = '' }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    getStorefrontCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return undefined;
    }
    const handle = setTimeout(() => {
      getStorefrontProducts({ search: query.trim(), limit: 6 })
        .then((res) => {
          setSuggestions(res.items || []);
          setOpen(true);
        })
        .catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const submit = useCallback(
    (e) => {
      e?.preventDefault();
      setOpen(false);
      const params = new URLSearchParams();
      if (query.trim()) params.set('search', query.trim());
      if (categoryId) params.set('categoryId', categoryId);
      navigate(`/products?${params.toString()}`);
    },
    [query, categoryId, navigate]
  );

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form
        onSubmit={submit}
        className="flex w-full overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900"
      >
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          aria-label="Search category"
          className="hidden w-32 shrink-0 border-0 border-r border-slate-200 bg-slate-50 px-2 text-caption text-slate-600 focus:outline-none focus:ring-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:block"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          placeholder="Search G&D Commerce"
          aria-label="Search products"
          className="w-full border-0 bg-transparent px-3 py-2 text-body text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
            }}
            aria-label="Clear search"
            className="flex items-center px-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button type="submit" aria-label="Search" className="flex items-center justify-center bg-brand-900 px-4 text-white transition-colors hover:bg-brand-950">
          <Search className="h-4 w-4" />
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-lg border border-slate-200 bg-white py-2 shadow-elevated dark:border-slate-800 dark:bg-slate-900">
          {suggestions.map((p) => (
            <Link
              key={p.id}
              to={`/products/${p.id}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-small text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <img src={p.imageUrl} alt="" className="h-8 w-8 shrink-0 rounded object-cover" loading="lazy" />
              <span className="flex-1 truncate">{p.name}</span>
              <span className="shrink-0 text-caption text-slate-400">{formatMoney(p.priceCents, p.currency)}</span>
            </Link>
          ))}
          <button
            type="button"
            onClick={submit}
            className="mt-1 block w-full border-t border-slate-100 px-4 pt-2 text-left text-caption font-medium text-brand-700 hover:text-brand-800 dark:border-slate-800 dark:text-brand-400"
          >
            See all results for &quot;{query}&quot;
          </button>
        </div>
      )}
    </div>
  );
}
