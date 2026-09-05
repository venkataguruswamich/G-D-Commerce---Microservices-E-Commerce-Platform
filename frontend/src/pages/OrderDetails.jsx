import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Container from '../components/ui/Container';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import OrderTimeline from '../components/ui/OrderTimeline';
import { getOrder } from '../api/orders';
import { formatMoney, formatDate } from '../utils/format';
import { extractErrorMessage } from '../utils/errors';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    getOrder(id)
      .then(setOrder)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useDocumentTitle(order ? `Order #${order.id.slice(0, 8)}` : 'Order');

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;
  if (!order) return null;

  return (
    <Container className="py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Orders', to: '/orders' }, { label: `#${order.id.slice(0, 8)}` }]} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h2 font-semibold text-slate-900 dark:text-white">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-small text-slate-500 dark:text-slate-400">Placed {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge status={order.status} />
          <Button variant="secondary" size="sm" onClick={load}>
            Refresh
          </Button>
        </div>
      </div>

      <Card padding="md" className="mb-6">
        <OrderTimeline status={order.status} />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card padding="md" className="lg:col-span-2">
          <h2 className="mb-4 text-h4 font-semibold text-slate-900 dark:text-white">Items</h2>
          <div className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-small font-medium text-slate-900 dark:text-white">{item.productName}</p>
                  <p className="text-caption text-slate-500 dark:text-slate-400">
                    {formatMoney(item.unitPriceCents)} × {item.quantity}
                  </p>
                </div>
                <p className="text-small font-semibold text-slate-900 dark:text-white">
                  {formatMoney(item.unitPriceCents * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
            <span className="text-h4 font-semibold text-slate-900 dark:text-white">Total</span>
            <span className="text-h4 font-semibold text-slate-900 dark:text-white">{formatMoney(order.totalCents, order.currency)}</span>
          </div>
        </Card>

        {order.shippingAddress && (
          <Card padding="md" className="h-fit">
            <h2 className="mb-3 text-h4 font-semibold text-slate-900 dark:text-white">Shipping Address</h2>
            <p className="text-small leading-relaxed text-slate-600 dark:text-slate-300">
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
            </p>
          </Card>
        )}
      </div>
    </Container>
  );
}
