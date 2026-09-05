import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cart from '../components/Cart';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PriceDisplay from '../components/ui/PriceDisplay';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatMoney } from '../utils/format';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function CartPage() {
  useDocumentTitle('Cart');
  const { items, updateQuantity, removeItem, totalCents, totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-h2 font-semibold text-slate-900 dark:text-white">Your Cart</h1>

      {items.length === 0 ? (
        <Cart items={items} onUpdateQuantity={updateQuantity} onRemove={removeItem} />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Card padding="md" className="lg:col-span-2">
            <Cart items={items} onUpdateQuantity={updateQuantity} onRemove={removeItem} />
          </Card>

          <Card padding="md" className="h-fit lg:sticky lg:top-24">
            <h2 className="mb-4 text-h4 font-semibold text-slate-900 dark:text-white">Order Summary</h2>
            <div className="flex items-center justify-between text-small text-slate-600 dark:text-slate-300">
              <span>Items ({totalItems})</span>
              <span>{formatMoney(totalCents)}</span>
            </div>
            <div className="my-4 border-t border-slate-200 dark:border-slate-800" />
            <div className="mb-6 flex items-center justify-between">
              <span className="text-h4 font-semibold text-slate-900 dark:text-white">Total</span>
              <PriceDisplay cents={totalCents} size="md" />
            </div>
            <Button onClick={handleCheckout} size="lg" className="w-full">
              Proceed to Checkout
            </Button>
            <Link
              to="/products"
              className="mt-4 block text-center text-small text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
            >
              Continue Shopping
            </Link>
          </Card>
        </div>
      )}
    </Container>
  );
}
