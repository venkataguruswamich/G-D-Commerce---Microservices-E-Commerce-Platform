import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Container from '../components/ui/Container';
import { listCategories } from '../api/categories';
import { extractErrorMessage } from '../utils/errors';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Categories() {
  useDocumentTitle('Categories');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-h2 font-semibold text-slate-900 dark:text-white">Categories</h1>
      {loading && <Loading />}
      <ErrorMessage message={error} />
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?categoryId=${category.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-elevated dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="text-h4 font-semibold text-slate-900 dark:text-white">{category.name}</h2>
              {category.description && <p className="mt-1 text-small text-slate-500 dark:text-slate-400">{category.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
