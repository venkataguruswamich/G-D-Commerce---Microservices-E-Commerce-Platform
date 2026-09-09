import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Container from '../components/ui/Container';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import RatingStars from '../components/ui/RatingStars';
import SpecsTable from '../components/pdp/SpecsTable';
import ProductImageGallery from '../components/pdp/ProductImageGallery';
import BuyBox from '../components/pdp/BuyBox';
import ReviewsSection from '../components/pdp/ReviewsSection';
import ProductCarousel from '../components/home/ProductCarousel';
import { getInventory } from '../api/products';
import { getStorefrontProduct, getStorefrontProducts } from '../utils/catalog';
import { getMerchandising } from '../utils/merchandising';
import { useCart } from '../context/CartContext';
import { useNotify } from '../context/NotificationContext';
import { extractErrorMessage } from '../utils/errors';
import useDocumentTitle from '../hooks/useDocumentTitle';

function featuresFromDescription(description) {
  if (!description) return [];
  return description
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [available, setAvailable] = useState(null);
  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCart();
  const notify = useNotify();

  useEffect(() => {
    setLoading(true);
    setQuantity(1);
    setAvailable(null);
    getStorefrontProduct(id)
      .then(setProduct)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));

    getInventory(id)
      .then((inv) => setAvailable(Math.max(0, inv.quantity - inv.reserved)))
      .catch(() => setAvailable(null));
  }, [id]);

  useEffect(() => {
    if (!product) return;
    setRelatedLoading(true);
    getStorefrontProducts({ categoryId: product.categoryId, limit: 9 })
      .then((data) => setRelated((data.items || []).filter((p) => p.id !== product.id).slice(0, 8)))
      .catch(() => setRelated([]))
      .finally(() => setRelatedLoading(false));
  }, [product]);

  const merch = useMemo(() => (product ? getMerchandising(product) : null), [product]);
  const features = useMemo(() => featuresFromDescription(product?.description), [product]);

  useDocumentTitle(product?.name);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!product || !merch) return null;

  const handleAddToCart = () => {
    addItem(product, quantity);
    notify(`Added ${quantity} × ${product.name} to cart`, 'success');
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate('/checkout');
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

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr_360px]">
        <div className="lg:col-span-1">
          <ProductImageGallery images={merch.images} alt={product.name} />
        </div>

        <div className="flex flex-col gap-3 lg:col-span-1">
          {product.categoryName && (
            <span className="text-caption font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {product.categoryName}
            </span>
          )}
          <h1 className="text-h2 font-semibold text-slate-900 dark:text-white">{product.name}</h1>
          <p className="text-small text-slate-500 dark:text-slate-400">
            by <span className="font-medium text-brand-600 dark:text-brand-400">{merch.brand}</span>
          </p>
          <RatingStars rating={merch.rating} reviewCount={merch.reviewCount} size="md" href="#reviews" />

          {features.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1.5 text-small text-slate-700 dark:text-slate-300">
              {features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4">
            <h2 className="mb-2 text-small font-semibold text-slate-900 dark:text-white">Specifications</h2>
            <SpecsTable specs={merch.specs} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <BuyBox
            product={product}
            merch={merch}
            available={available}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            justAdded={justAdded}
          />
        </div>
      </div>

      <div className="mt-16 border-t border-slate-200 dark:border-slate-800">
        <ProductCarousel
          eyebrow="Related items"
          title="Customers who bought this also bought"
          products={related}
          loading={relatedLoading}
        />
      </div>

      <div className="mt-4 border-t border-slate-200 pt-10 dark:border-slate-800">
        <h2 className="mb-6 text-h3 font-semibold text-slate-900 dark:text-white">Customer Reviews</h2>
        <ReviewsSection productId={product.id} rating={merch.rating} reviewCount={merch.reviewCount} images={merch.images} />
      </div>
    </Container>
  );
}
