import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import ErrorMessage from '../components/ErrorMessage';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import PriceDisplay from '../components/ui/PriceDisplay';
import EmptyState from '../components/ui/EmptyState';
import { useCart } from '../context/CartContext';
import { useNotify } from '../context/NotificationContext';
import { createOrder } from '../api/orders';
import { createPayment } from '../api/payments';
import { formatMoney } from '../utils/format';
import { extractErrorMessage } from '../utils/errors';
import useDocumentTitle from '../hooks/useDocumentTitle';

const EMPTY_ADDRESS = { line1: '', line2: '', city: '', state: '', postalCode: '', country: '' };

export default function Checkout() {
  useDocumentTitle('Checkout');
  const { items, totalCents, clearCart } = useCart();
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [submitting, setSubmitting] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState(null);
  const notify = useNotify();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <Container className="py-8">
        <EmptyState icon="cart" title="Your cart is empty" description="Add products before checking out." action={{ label: 'Browse Products', to: '/products' }} />
      </Container>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const order = await createOrder({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        shippingAddress: address,
      });

      setProcessingPayment(true);
      const payment = await createPayment({ orderId: order.id });

      clearCart();

      if (payment.status === 'SUCCESS') {
        notify('Payment successful! Your order is confirmed.', 'success');
      } else {
        notify('Payment failed. Your order has been cancelled.', 'error');
      }

      navigate(`/orders/${order.id}`);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
      setProcessingPayment(false);
    }
  };

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-h2 font-semibold text-slate-900 dark:text-white">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card padding="md" className="lg:col-span-2">
          <h2 className="mb-4 text-h4 font-semibold text-slate-900 dark:text-white">Shipping Address</h2>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <FormField label="Address Line 1" id="line1">
              <Input id="line1" required value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
            </FormField>
            <FormField label="Address Line 2 (optional)" id="line2">
              <Input id="line2" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
            </FormField>
            <FormField label="City" id="city">
              <Input id="city" required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
            </FormField>
            <FormField label="State" id="state">
              <Input id="state" required value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
            </FormField>
            <FormField label="Postal Code" id="postalCode">
              <Input
                id="postalCode"
                required
                value={address.postalCode}
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
              />
            </FormField>
            <FormField label="Country" id="country">
              <Input id="country" required value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
            </FormField>
          </div>
        </Card>

        <Card padding="md" className="h-fit">
          <h2 className="mb-4 text-h4 font-semibold text-slate-900 dark:text-white">Order Summary</h2>
          <ul className="mb-4 flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between text-small text-slate-600 dark:text-slate-300">
                <span className="line-clamp-1 pr-2">
                  {item.name} × {item.quantity}
                </span>
                <span className="shrink-0">{formatMoney(item.priceCents * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="my-4 border-t border-slate-200 dark:border-slate-800" />
          <div className="mb-6 flex items-center justify-between">
            <span className="text-h4 font-semibold text-slate-900 dark:text-white">Total</span>
            <PriceDisplay cents={totalCents} size="md" />
          </div>

          <ErrorMessage message={error} />

          <Button type="submit" disabled={submitting} size="lg" className="w-full">
            {processingPayment ? 'Processing payment…' : submitting ? 'Placing order…' : 'Place Order'}
          </Button>

          <div className="mt-4 flex items-center gap-2 text-caption text-slate-500 dark:text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 shrink-0">
              <rect x="5" y="11" width="14" height="9" rx="1.5" />
              <path strokeLinecap="round" d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            <span>Demo checkout — payment is simulated and no real charge occurs.</span>
          </div>
        </Card>
      </form>
    </Container>
  );
}
