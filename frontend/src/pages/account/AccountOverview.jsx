import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, MapPin } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/Loading';
import OrderTimeline from '../../components/ui/OrderTimeline';
import { listOrders } from '../../api/orders';
import { useAddressBook } from '../../context/AddressBookContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatMoney } from '../../utils/format';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const ACTIVE_STATUSES = new Set(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED']);

export default function AccountOverview() {
  useDocumentTitle('Account Overview');
  const { user } = useAuth();
  const { defaultAddress, addresses } = useAddressBook();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listOrders({ limit: 5 })
      .then((data) => setOrders(data.items || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const activeOrder = orders.find((o) => ACTIVE_STATUSES.has(o.status));

  if (loading) return <Loading />;

  return (
    <div className="flex flex-col gap-6">
      <Card padding="lg">
        <p className="text-small text-slate-500 dark:text-slate-400">Welcome back,</p>
        <h2 className="text-h3 font-semibold text-slate-900 dark:text-white">{user?.firstName}</h2>
      </Card>

      {activeOrder && (
        <Card padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-h4 font-semibold text-slate-900 dark:text-white">
              Order #{activeOrder.id.slice(0, 8)} is on its way
            </h3>
            <Badge status={activeOrder.status} />
          </div>
          <OrderTimeline status={activeOrder.status} />
          <Link
            to={`/account/orders/${activeOrder.id}`}
            className="mt-4 inline-block text-small font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            View order details
          </Link>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card padding="md">
          <h3 className="mb-3 text-h4 font-semibold text-slate-900 dark:text-white">Recent Orders</h3>
          {orders.length === 0 ? (
            <p className="text-small text-slate-500 dark:text-slate-400">No orders yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {orders.slice(0, 3).map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 text-small">
                  <div>
                    <Link to={`/account/orders/${order.id}`} className="font-medium text-slate-900 hover:text-brand-600 dark:text-white">
                      #{order.id.slice(0, 8)}
                    </Link>
                    <p className="text-caption text-slate-500 dark:text-slate-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <Badge status={order.status} />
                </li>
              ))}
            </ul>
          )}
          <Link to="/account/orders" className="mt-3 inline-block text-small font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
            View all orders
          </Link>
        </Card>

        <Card padding="md">
          <h3 className="mb-3 flex items-center gap-2 text-h4 font-semibold text-slate-900 dark:text-white">
            <Wallet className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            G&amp;D Wallet
          </h3>
          <p className="text-h2 font-bold text-slate-900 dark:text-white">{formatMoney(0)}</p>
          <p className="mt-1 text-caption text-slate-500 dark:text-slate-400">Demo balance — not a real wallet.</p>
        </Card>

        <Card padding="md" className="sm:col-span-2">
          <h3 className="mb-3 flex items-center gap-2 text-h4 font-semibold text-slate-900 dark:text-white">
            <MapPin className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            Default Address
          </h3>
          {defaultAddress ? (
            <p className="text-small text-slate-600 dark:text-slate-300">
              {defaultAddress.label ? `${defaultAddress.label} — ` : ''}
              {defaultAddress.line1}, {defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode}
            </p>
          ) : (
            <p className="text-small text-slate-500 dark:text-slate-400">
              {addresses.length === 0 ? 'No saved addresses yet.' : 'No default address set.'}
            </p>
          )}
          <Link to="/account/addresses" className="mt-3 inline-block text-small font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
            Manage addresses
          </Link>
        </Card>
      </div>
    </div>
  );
}
