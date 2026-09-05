import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import Container from '../../components/ui/Container';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import { listInventory } from '../../api/products';
import { formatDate } from '../../utils/format';
import { extractErrorMessage } from '../../utils/errors';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const LIMIT = 20;

export default function AdminInventory() {
  useDocumentTitle('Inventory');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    listInventory({ page, limit: LIMIT })
      .then((data) => {
        setRows(data.items);
        setTotal(data.total);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <Container className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-h2 font-semibold text-slate-900 dark:text-white">Inventory</h1>
        <Link to="/admin/products" className="text-small font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
          Edit stock levels
        </Link>
      </div>
      <ErrorMessage message={error} onRetry={load} />

      {loading ? (
        <Loading />
      ) : (
        <>
          <Card padding="none" className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead>
                <tr className="border-b border-slate-200 text-caption uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">On Hand</th>
                  <th className="px-4 py-3 font-medium">Reserved</th>
                  <th className="px-4 py-3 font-medium">Available</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.map((row) => {
                  const available = Math.max(0, row.quantity - row.reserved);
                  return (
                    <tr key={row.productId}>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{row.sku}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{row.name}</td>
                      <td className="px-4 py-3">{row.quantity}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{row.reserved}</td>
                      <td className="px-4 py-3">
                        <Badge tone={available === 0 ? 'danger' : available <= 5 ? 'warning' : 'success'}>{available}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{row.updatedAt ? formatDate(row.updatedAt) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </Container>
  );
}
