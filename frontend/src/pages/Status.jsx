import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import OrderTimeline from '../components/ui/OrderTimeline';
import Loading from '../components/Loading';
import { listOrders } from '../api/orders';
import { formatDate, formatMoney } from '../utils/format';
import { extractErrorMessage } from '../utils/errors';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Status() {
  useDocumentTitle('Order Status');
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const selectedId = searchParams.get('order');

  useEffect(() => {
    listOrders({})
      .then((data) => setOrders(data.items))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const selectedOrder = orders.find((order) => order.id === selectedId) || orders[0];

  const chooseOrder = (event) => {
    const next = new URLSearchParams(searchParams);
    next.set('order', event.target.value);
    setSearchParams(next);
  };

  return (
    <Container className="py-8">
      <div className="mb-8 max-w-2xl">
        <p className="mb-2 text-caption font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">Live order desk</p>
        <h1 className="text-h1 font-semibold text-slate-900 dark:text-white">Track your order</h1>
        <p className="mt-3 text-body text-slate-500 dark:text-slate-400">Follow the journey from confirmation through delivery in one clear view.</p>
      </div>

      {loading && <Loading />}
      <ErrorMessage message={error} />

      {!loading && !error && orders.length === 0 && (
        <Card padding="lg" className="max-w-xl">
          <h2 className="text-h3 font-semibold text-slate-900 dark:text-white">No active orders</h2>
          <p className="mt-2 text-body text-slate-500 dark:text-slate-400">Your order status will appear here after checkout.</p>
          <Link to="/products" className="mt-5 inline-flex text-small font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">Browse products</Link>
        </Card>
      )}

      {!loading && !error && selectedOrder && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Card padding="lg">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-caption font-medium uppercase tracking-wide text-slate-400">Selected order</p>
                <h2 className="mt-1 text-h3 font-semibold text-slate-900 dark:text-white">#{selectedOrder.id.slice(0, 8)}</h2>
                <p className="mt-1 text-small text-slate-500 dark:text-slate-400">Placed {formatDate(selectedOrder.createdAt)}</p>
              </div>
              <Badge status={selectedOrder.status} />
            </div>
            <div className="mt-10 rounded-xl bg-slate-50 p-5 dark:bg-slate-950/60">
              <OrderTimeline status={selectedOrder.status} />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
              <span className="text-small text-slate-500 dark:text-slate-400">Order total</span>
              <span className="text-h4 font-semibold text-slate-900 dark:text-white">{formatMoney(selectedOrder.totalCents, selectedOrder.currency)}</span>
            </div>
          </Card>

          <Card padding="md">
            <label htmlFor="order-select" className="text-label font-semibold text-slate-900 dark:text-white">Recent orders</label>
            <select id="order-select" value={selectedOrder.id} onChange={chooseOrder} className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-small text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              {orders.map((order) => (
                <option key={order.id} value={order.id}>#{order.id.slice(0, 8)} · {order.status}</option>
              ))}
            </select>
            <Link to={`/orders/${selectedOrder.id}`} className="mt-5 inline-flex text-small font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">View order details</Link>
          </Card>
        </div>
      )}
    </Container>
  );
}