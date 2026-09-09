import React from 'react';
import { Minus, Plus, X } from 'lucide-react';
import Drawer from '../ui/Drawer';
import Button from '../ui/Button';
import PriceDisplay from '../ui/PriceDisplay';
import EmptyState from '../ui/EmptyState';
import { useCart } from '../../context/CartContext';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, totalCents, totalItems, updateQuantity, removeItem } = useCart();

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      side="right"
      title={`Cart (${totalItems})`}
      footer={
        items.length > 0 && (
          <div className="flex w-full flex-col gap-2">
            <div className="flex items-center justify-between text-small font-medium text-slate-700 dark:text-slate-200">
              <span>Subtotal</span>
              <PriceDisplay cents={totalCents} size="sm" />
            </div>
            <Button variant="cta" className="w-full" to="/checkout" onClick={onClose}>
              Checkout
            </Button>
            <Button variant="secondary" className="w-full" to="/cart" onClick={onClose}>
              View Cart
            </Button>
          </div>
        )
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon="cart"
          title="Your cart is empty"
          description="Find something you'll love."
          action={{ label: 'Shop Now', to: '/products', onClick: onClose }}
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-3">
              <img src={item.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" loading="lazy" />
              <div className="flex flex-1 flex-col gap-1">
                <p className="line-clamp-2 text-small font-medium text-slate-800 dark:text-slate-100">{item.name}</p>
                <PriceDisplay cents={item.priceCents} size="sm" />
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="flex h-7 w-7 items-center justify-center text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-[1.5rem] text-center text-caption font-medium text-slate-800 dark:text-slate-100">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="flex h-7 w-7 items-center justify-center text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.name}`}
                    className="ml-auto text-slate-400 hover:text-danger-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
