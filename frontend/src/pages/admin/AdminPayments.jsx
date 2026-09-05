import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import Container from '../../components/ui/Container';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import { Select } from '../../components/ui/Input';
import { listPayments } from '../../api/payments';
import { formatMoney, formatDate } from '../../utils/format';
import { extractErrorMessage } from '../../utils/errors';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const STATUS_OPTIONS = ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'];
const LIMIT = 20;

export default function AdminPayments() {
  useDocumentTitle('Manage Payments');
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    listPayments({ status: status || undefined, page, limit: LIMIT })
      .then((data) => {
        setPayments(data.items);
        setTotal(data.total);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status, page]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <Container className="py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-h2 font-semibold text-slate-900 dark:text-white">Manage Payments</h1>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="w-44"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
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
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{payment.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">
                      <Link to={`/orders/${payment.orderId}`} className="text-brand-600 hover:text-brand-700 dark:text-brand-400">
                        {payment.orderId.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{formatMoney(payment.amountCents, payment.currency)}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{payment.method}</td>
                    <td className="px-4 py-3">
                      <Badge status={payment.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDate(payment.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </Container>
  );
}
