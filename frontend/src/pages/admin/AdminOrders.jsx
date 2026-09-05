import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import Container from '../../components/ui/Container';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Select } from '../../components/ui/Input';
import { useNotify } from '../../context/NotificationContext';
import { listOrders, updateOrderStatus } from '../../api/orders';
import { formatMoney, formatDate } from '../../utils/format';
import { extractErrorMessage } from '../../utils/errors';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const NEXT_STATUS_OPTIONS = {
  PENDING: ['CONFIRMED', 'PROCESSING', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export default function AdminOrders() {
  useDocumentTitle('Manage Orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const notify = useNotify();

  const load = () => {
    setLoading(true);
    listOrders({ limit: 50 })
      .then((data) => setOrders(data.items))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStatusChange = async (id, status) => {
    if (!status) return;
    try {
      await updateOrderStatus(id, status);
      notify(`Order updated to ${status}`, 'success');
      load();
    } catch (err) {
      notify(extractErrorMessage(err), 'error');
    }
  };

  if (loading) return <Loading />;

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-h2 font-semibold text-slate-900 dark:text-white">Manage Orders</h1>
      <ErrorMessage message={error} onRetry={load} />

      <Card padding="none" className="overflow-x-auto">
        <table className="w-full text-left text-small">
          <thead>
            <tr className="border-b border-slate-200 text-caption uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Placed</th>
              <th className="px-4 py-3 font-medium">Update Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3">
                  <Link to={`/orders/${order.id}`} className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                    {order.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge status={order.status} />
                </td>
                <td className="px-4 py-3">{formatMoney(order.totalCents, order.currency)}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-3">
                  <Select
                    defaultValue=""
                    className="w-44"
                    disabled={(NEXT_STATUS_OPTIONS[order.status] || []).length === 0}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    <option value="">Change status…</option>
                    {(NEXT_STATUS_OPTIONS[order.status] || []).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Container>
  );
}
