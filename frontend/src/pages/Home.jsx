import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { listProducts } from '../api/products';
import { listCategories } from '../api/categories';
import { extractErrorMessage } from '../utils/errors';
import useDocumentTitle from '../hooks/useDocumentTitle';

const BENEFITS = [
  {
    title: 'Secure checkout',
    description: 'Your payment details are never stored on our servers.',
    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
  },
  {
    title: 'Order tracking',
    description: 'Follow every order from confirmation to delivery.',
    icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 8h6m-6 4h6',
  },
  {
    title: 'Responsive support',
    description: 'Reach out any time — we’re here to help with your order.',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z',
  },
];

export default function Home() {
  useDocumentTitle();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    setLoading(true);
    listProducts({ limit: 8, sort: 'newest' })
      .then((data) => setProducts(data.items))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    listCategories()
      .then((data) => setCategories(data.slice(0, 6)))
      .catch(() => {});
  }, []);

  return (
    <div>
      <section className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">
        <Container className="flex flex-col items-center gap-5 py-20 text-center">
          <h1 className="text-display font-bold text-slate-900 dark:text-white">G&amp;D Commerce</h1>
          <p className="max-w-md text-body text-slate-600 dark:text-slate-400">
            Global solutions, reliable partners — browse the catalog, add to cart, and check out.
          </p>
          <Button to="/products" size="lg">
            Browse Products
          </Button>
        </Container>
      </section>

      {categories.length > 0 && (
        <Container className="py-12">
          <h2 className="mb-6 text-h3 font-semibold text-slate-900 dark:text-white">Shop by Category</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?categoryId=${category.id}`}
                className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 text-center text-small font-medium text-slate-700 transition-shadow hover:shadow-elevated dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </Container>
      )}

      <Container className="py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-caption font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">Just landed</p>
            <h2 className="text-h3 font-semibold text-slate-900 dark:text-white">New Arrivals</h2>
          </div>
          <Link to="/products?sort=newest" className="text-small font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
            View all
          </Link>
        </div>
        {loading && <SkeletonGrid count={8} />}
        <ErrorMessage message={error} />
        {!loading && !error && (
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
            {products.map((product) => (
              <div key={product.id} className="w-[min(78vw,18rem)] shrink-0 snap-start sm:w-[18rem] lg:w-auto">
                <ProductGrid products={[product]} />
              </div>
            ))}
          </div>
        )}
      </Container>

      <section className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">
        <Container className="grid grid-cols-1 gap-8 py-12 sm:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d={benefit.icon} />
                </svg>
              </div>
              <h3 className="text-h4 font-semibold text-slate-900 dark:text-white">{benefit.title}</h3>
              <p className="max-w-xs text-small text-slate-500 dark:text-slate-400">{benefit.description}</p>
            </div>
          ))}
        </Container>
      </section>
    </div>
  );
}
