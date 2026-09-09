import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { listOrders } from '../../api/orders';
import { formatMoney, formatDate } from '../../utils/format';
import { extractErrorMessage } from '../../utils/errors';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function AccountOrders() {
  useDocumentTitle('Your Orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    listOrders({})
      .then((data) => setOrders(data.items))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="orders"
        title="No orders yet"
        description="Orders you place will show up here, with real-time tracking."
        action={{ label: 'Shop Now', to: '/products' }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <Card key={order.id} padding="md" className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-small font-medium text-slate-900 dark:text-white">Order #{order.id.slice(0, 8)}</p>
            <p className="text-caption text-slate-500 dark:text-slate-400">Placed {formatDate(order.createdAt)}</p>
          </div>
          <Badge status={order.status} />
          <p className="text-small font-semibold text-slate-900 dark:text-white">{formatMoney(order.totalCents, order.currency)}</p>
          <Link to={`/account/orders/${order.id}`} className="text-small font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
            View Details
          </Link>
        </Card>
      ))}
    </div>
  );
}
