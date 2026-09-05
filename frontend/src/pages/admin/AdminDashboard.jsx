import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import Container from '../../components/ui/Container';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { listProducts } from '../../api/products';
import { listOrders } from '../../api/orders';
import { listPayments } from '../../api/payments';
import { listUsers } from '../../api/users';
import { formatMoney, formatDate } from '../../utils/format';
import { extractErrorMessage } from '../../utils/errors';
import useDocumentTitle from '../../hooks/useDocumentTitle';

// Widest page the order-list API allows in one call. Revenue and the status
// breakdown below are computed from this most-recent batch, not the
// all-time total — see the note rendered next to the revenue figure.
const ORDERS_SAMPLE_LIMIT = 100;

const STATUS_BAR_CLASSES = {
  PENDING: 'bg-warning-600',
  CONFIRMED: 'bg-info-600',
  PROCESSING: 'bg-info-600',
  SHIPPED: 'bg-brand-600',
  DELIVERED: 'bg-success-600',
  CANCELLED: 'bg-danger-600',
  SUCCESS: 'bg-success-600',
  FAILED: 'bg-danger-600',
  REFUNDED: 'bg-slate-400',
};

function StatusBreakdown({ title, counts, emptyLabel }) {
  const entries = Object.entries(counts);
  const max = Math.max(1, ...Object.values(counts));

  return (
    <Card padding="lg">
      <h2 className="mb-4 text-h4 font-semibold text-slate-900 dark:text-white">{title}</h2>
      {entries.length === 0 ? (
        <p className="text-small text-slate-500 dark:text-slate-400">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map(([status, count]) => (
            <li key={status}>
              <div className="mb-1 flex items-center justify-between text-small">
                <span className="font-medium text-slate-700 dark:text-slate-200">{status}</span>
                <span className="text-slate-500 dark:text-slate-400">{count}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full ${STATUS_BAR_CLASSES[status] || 'bg-slate-400'}`}
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

const KPI_ICONS = {
  revenue: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  orders: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 8h6m-6 4h6',
  customers: 'M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m5-8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm6 3a4 4 0 1 1-8 0',
  products: 'M20 7 12 3 4 7m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
};

function KpiCard({ label, value, icon, sublabel }) {
  return (
    <Card padding="lg" className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-caption font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1 text-h2 font-bold text-slate-900 dark:text-white">{value}</p>
        {sublabel && <p className="mt-1 text-caption text-slate-400 dark:text-slate-500">{sublabel}</p>}
      </div>
    </Card>
  );
}

export default function AdminDashboard() {
  useDocumentTitle('Admin Dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productTotal, setProductTotal] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [orderSample, setOrderSample] = useState([]);
  const [paymentSample, setPaymentSample] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      listProducts({ limit: 1 }),
      listOrders({ limit: ORDERS_SAMPLE_LIMIT }),
      listUsers({ limit: 100 }),
      listPayments({ limit: 100 }),
    ])
      .then(([products, orders, users, payments]) => {
        setProductTotal(products.total);
        setOrderTotal(orders.total);
        setOrderSample(orders.items);
        setCustomerCount(users.items.filter((u) => u.role === 'CUSTOMER').length);
        setPaymentSample(payments.items);
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  const revenueCents = orderSample
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + Number(o.totalCents), 0);
  const sampleIsPartial = orderTotal > orderSample.length;

  const statusCounts = orderSample.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  const paymentCounts = paymentSample.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});
  const recentOrders = orderSample.slice(0, 5);

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-h2 font-semibold text-slate-900 dark:text-white">Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Revenue"
          value={formatMoney(revenueCents)}
          icon={KPI_ICONS.revenue}
          sublabel={sampleIsPartial ? `From last ${orderSample.length} orders` : 'Excludes cancelled orders'}
        />
        <KpiCard label="Orders" value={orderTotal.toLocaleString()} icon={KPI_ICONS.orders} />
        <KpiCard label="Customers" value={customerCount.toLocaleString()} icon={KPI_ICONS.customers} />
        <KpiCard label="Products" value={productTotal.toLocaleString()} icon={KPI_ICONS.products} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StatusBreakdown title="Orders by Status" counts={statusCounts} emptyLabel="No orders yet." />
        <StatusBreakdown title="Payments by Outcome" counts={paymentCounts} emptyLabel="No payments yet." />
      </div>

      <Card padding="lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-h4 font-semibold text-slate-900 dark:text-white">Recent Orders</h2>
          <Link to="/admin/orders" className="text-small font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-small text-slate-500 dark:text-slate-400">No orders yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex items-center justify-between gap-4 py-3 text-small hover:text-brand-600 dark:hover:text-brand-400"
              >
                <span className="font-medium text-slate-900 dark:text-white">#{order.id.slice(0, 8)}</span>
                <span className="text-slate-500 dark:text-slate-400">{formatDate(order.createdAt)}</span>
                <Badge status={order.status} />
                <span className="shrink-0 font-semibold text-slate-900 dark:text-white">
                  {formatMoney(order.totalCents, order.currency)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </Container>
  );
}
