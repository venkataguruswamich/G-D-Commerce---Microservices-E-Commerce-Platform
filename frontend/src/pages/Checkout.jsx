import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CreditCard, Landmark, Smartphone } from 'lucide-react';
import AddressForm from '../components/account/AddressForm';
import ErrorMessage from '../components/ErrorMessage';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PriceDisplay from '../components/ui/PriceDisplay';
import EmptyState from '../components/ui/EmptyState';
import { useCart } from '../context/CartContext';
import { useAddressBook } from '../context/AddressBookContext';
import { usePaymentMethods } from '../context/PaymentMethodsContext';
import { useNotify } from '../context/NotificationContext';
import { createOrder } from '../api/orders';
import { createPayment } from '../api/payments';
import { formatMoney } from '../utils/format';
import { extractErrorMessage } from '../utils/errors';
import useDocumentTitle from '../hooks/useDocumentTitle';

const EMPTY_ADDRESS = { line1: '', line2: '', city: '', state: '', postalCode: '', country: '' };

// The real payment-service only ever models `method` as an enum label
// (SIMULATED|CARD|WALLET) — there is no dedicated UPI/net-banking value, so
// both map to the generic WALLET label rather than inventing a fake one.
function methodToApiValue(savedMethod) {
  if (!savedMethod) return 'SIMULATED';
  if (savedMethod.type === 'CARD') return 'CARD';
  return 'WALLET';
}

function methodIcon(type) {
  if (type === 'CARD') return CreditCard;
  if (type === 'UPI') return Smartphone;
  return Landmark;
}

export default function Checkout() {
  useDocumentTitle('Checkout');
  const { items, totalCents, clearCart } = useCart();
  const { addresses, defaultAddress, addAddress } = useAddressBook();
  const { methods, defaultMethod } = usePaymentMethods();

  const [address, setAddress] = useState(defaultAddress || EMPTY_ADDRESS);
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?.id || null);
  const [saveAddress, setSaveAddress] = useState(addresses.length === 0);
  const [selectedMethodId, setSelectedMethodId] = useState(defaultMethod?.id || null);
  const [submitting, setSubmitting] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState(null);
  const notify = useNotify();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <Container className="py-8">
        <EmptyState icon="cart" title="Your cart is empty" description="Add products before checking out." action={{ label: 'Shop Now', to: '/products' }} />
      </Container>
    );
  }

  const pickSavedAddress = (saved) => {
    setSelectedAddressId(saved.id);
    setAddress({
      line1: saved.line1,
      line2: saved.line2,
      city: saved.city,
      state: saved.state,
      postalCode: saved.postalCode,
      country: saved.country,
    });
    setSaveAddress(false);
  };

  const handleAddressChange = (next) => {
    setAddress(next);
    setSelectedAddressId(null);
  };

  const selectedMethod = methods.find((m) => m.id === selectedMethodId) || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const order = await createOrder({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        shippingAddress: address,
      });

      if (saveAddress && !selectedAddressId) {
        addAddress(address);
      }

      setProcessingPayment(true);
      const payment = await createPayment({ orderId: order.id, method: methodToApiValue(selectedMethod) });

      clearCart();

      if (payment.status === 'SUCCESS') {
        notify('Payment successful! Your order is confirmed.', 'success');
      } else {
        notify('Payment failed. Your order has been cancelled.', 'error');
      }

      navigate(`/account/orders/${order.id}`);
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
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card padding="md">
            <h2 className="mb-4 text-h4 font-semibold text-slate-900 dark:text-white">Shipping Address</h2>

            {addresses.length > 0 && (
              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {addresses.map((saved) => (
                  <button
                    key={saved.id}
                    type="button"
                    onClick={() => pickSavedAddress(saved)}
                    className={`flex flex-col gap-0.5 rounded-lg border px-3 py-2.5 text-left text-small transition-colors ${
                      selectedAddressId === saved.id
                        ? 'border-brand-600 ring-1 ring-brand-600'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white">
                      {selectedAddressId === saved.id && <Check className="h-3.5 w-3.5 text-brand-600" />}
                      {saved.label || 'Address'}
                      {saved.isDefault && <span className="text-caption text-slate-400">(Default)</span>}
                    </span>
                    <span className="text-caption text-slate-500 dark:text-slate-400">
                      {saved.line1}, {saved.city}, {saved.state} {saved.postalCode}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <AddressForm value={address} onChange={handleAddressChange} idPrefix="checkout-address" />

            <label className="mt-2 flex items-center gap-2 text-small text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800"
              />
              Save this address for next time
            </label>
          </Card>

          <Card padding="md">
            <h2 className="mb-4 text-h4 font-semibold text-slate-900 dark:text-white">Payment Method</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setSelectedMethodId(null)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-small transition-colors ${
                  selectedMethodId === null
                    ? 'border-brand-600 ring-1 ring-brand-600'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                }`}
              >
                <CreditCard className="h-4 w-4 text-slate-400" />
                <span className="font-medium text-slate-900 dark:text-white">Demo payment (no card required)</span>
              </button>
              {methods.map((method) => {
                const Icon = methodIcon(method.type);
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethodId(method.id)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-small transition-colors ${
                      selectedMethodId === method.id
                        ? 'border-brand-600 ring-1 ring-brand-600'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                    <span className="font-medium text-slate-900 dark:text-white">
                      {method.nickname || (method.type === 'CARD' ? `${method.brand} •••• ${method.last4}` : method.type)}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <Card padding="md" className="h-fit lg:sticky lg:top-24">
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
