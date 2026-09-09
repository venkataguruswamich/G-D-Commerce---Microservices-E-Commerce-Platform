import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ShieldCheck, RotateCcw, Truck, Check } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import PriceDisplay from '../ui/PriceDisplay';
import QuantityStepper from '../ui/QuantityStepper';

const ZIP_STORAGE_KEY = 'deliveryZip';

const TRUST_BADGES = [
  { icon: ShieldCheck, label: '100% Purchase Protection' },
  { icon: RotateCcw, label: '7-Day Replacement' },
  { icon: Truck, label: 'Free Shipping' },
];

function estimatedDeliveryDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function BuyBox({ product, merch, available, quantity, onQuantityChange, onAddToCart, onBuyNow, justAdded }) {
  const outOfStock = available === 0;
  const [zip, setZip] = useState(() => {
    try {
      return localStorage.getItem(ZIP_STORAGE_KEY) || '';
    } catch (err) {
      return '';
    }
  });
  const [zipDraft, setZipDraft] = useState(zip);

  const saveZip = (e) => {
    e.preventDefault();
    const trimmed = zipDraft.trim();
    setZip(trimmed);
    try {
      if (trimmed) localStorage.setItem(ZIP_STORAGE_KEY, trimmed);
    } catch (err) {
      // localStorage unavailable — the estimate still renders for this session.
    }
  };

  return (
    <Card padding="lg" className="flex flex-col gap-4">
      <PriceDisplay
        cents={product.priceCents}
        currency={product.currency}
        size="lg"
        mrpCents={merch.mrpCents}
        discountPercent={merch.discountPercent}
      />

      {available !== null && (
        <Badge tone={outOfStock ? 'danger' : available <= 5 ? 'warning' : 'success'} className="w-fit">
          {outOfStock ? 'Out of stock' : available <= 5 ? `Only ${available} left — order soon` : 'In Stock'}
        </Badge>
      )}

      <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <p className="mb-1 flex items-center gap-1.5 text-small font-medium text-slate-700 dark:text-slate-200">
          <Truck className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          {merch.isPrimeEligible ? 'Express delivery' : 'Standard delivery'}: {estimatedDeliveryDate(merch.deliveryDays)}
        </p>
        <form onSubmit={saveZip} className="flex items-center gap-2 text-caption text-slate-500 dark:text-slate-400">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>Deliver to</span>
          <input
            value={zipDraft}
            onChange={(e) => setZipDraft(e.target.value)}
            placeholder="ZIP code"
            className="w-24 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-caption text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <button type="submit" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
            Check
          </button>
        </form>
      </div>

      <div className="flex items-center gap-3">
        <QuantityStepper value={quantity} onChange={onQuantityChange} min={1} max={available ?? undefined} />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="cta" size="lg" onClick={onAddToCart} disabled={outOfStock} className="flex-1 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={outOfStock ? 'out' : justAdded ? 'added' : 'add'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="inline-flex items-center gap-2"
            >
              {outOfStock ? (
                'Out of stock'
              ) : justAdded ? (
                <>
                  <Check className="h-4 w-4" />
                  Added
                </>
              ) : (
                'Add to Cart'
              )}
            </motion.span>
          </AnimatePresence>
        </Button>
        <Button variant="buyNow" size="lg" onClick={onBuyNow} disabled={outOfStock} className="flex-1">
          Buy Now
        </Button>
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
        {TRUST_BADGES.map((badge) => (
          <div key={badge.label} className="flex items-center gap-2 text-caption text-slate-500 dark:text-slate-400">
            <badge.icon className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
            {badge.label}
          </div>
        ))}
      </div>
    </Card>
  );
}
