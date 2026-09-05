import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Container from '../components/ui/Container';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import PriceDisplay from '../components/ui/PriceDisplay';
import QuantityStepper from '../components/ui/QuantityStepper';
import { getProduct, getInventory } from '../api/products';
import { useCart } from '../context/CartContext';
import { useNotify } from '../context/NotificationContext';
import { extractErrorMessage } from '../utils/errors';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [available, setAvailable] = useState(null); // null = unknown, don't block on it
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCart();
  const notify = useNotify();

  useEffect(() => {
    setLoading(true);
    setQuantity(1);
    getProduct(id)
      .then(setProduct)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));

    getInventory(id)
      .then((inv) => setAvailable(Math.max(0, inv.quantity - inv.reserved)))
      .catch(() => setAvailable(null));
  }, [id]);

  useDocumentTitle(product?.name);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!product) return null;

  const outOfStock = available === 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
    notify(`Added ${quantity} × ${product.name} to cart`, 'success');
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <Container className="py-8">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Products', to: '/products' },
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-16 w-16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 14M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm9 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {product.categoryName && (
            <span className="text-caption font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {product.categoryName}
            </span>
          )}
          <h1 className="text-h2 font-semibold text-slate-900 dark:text-white">{product.name}</h1>
          <PriceDisplay cents={product.priceCents} currency={product.currency} size="lg" />

          {available !== null && (
            <Badge tone={outOfStock ? 'danger' : available <= 5 ? 'warning' : 'success'}>
              {outOfStock ? 'Out of stock' : available <= 5 ? `Only ${available} left` : 'In stock'}
            </Badge>
          )}

          {product.description && <p className="text-body leading-relaxed text-slate-600 dark:text-slate-300">{product.description}</p>}

          <div className="mt-2 flex items-center gap-4">
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={available !== null ? available : undefined}
            />
            <Button type="button" onClick={handleAddToCart} disabled={outOfStock} size="lg" className="flex-1 overflow-hidden sm:flex-none">
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
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Added
                    </>
                  ) : (
                    'Add to Cart'
                  )}
                </motion.span>
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
