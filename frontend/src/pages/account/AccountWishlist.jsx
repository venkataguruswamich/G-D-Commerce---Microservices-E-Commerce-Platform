import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PriceDisplay from '../../components/ui/PriceDisplay';
import EmptyState from '../../components/ui/EmptyState';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useNotify } from '../../context/NotificationContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function AccountWishlist() {
  useDocumentTitle('Wishlist');
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();
  const notify = useNotify();

  if (items.length === 0) {
    return (
      <EmptyState
        icon="box"
        title="Your wishlist is empty"
        description="Save items you love to buy them later, or move them straight to your cart."
        action={{ label: 'Shop Now', to: '/products' }}
      />
    );
  }

  const handleMoveToCart = (item) => {
    addItem({ id: item.productId, name: item.name, priceCents: item.priceCents, imageUrl: item.imageUrl });
    removeItem(item.productId);
    notify(`Moved ${item.name} to cart`, 'success');
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.productId} padding="md" className="relative flex flex-col gap-3">
          <button
            type="button"
            onClick={() => removeItem(item.productId)}
            aria-label={`Remove ${item.name} from wishlist`}
            className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-danger-600 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
          <Link to={`/products/${item.productId}`} className="aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
            {item.imageUrl && <img src={item.imageUrl} alt={item.name} loading="lazy" className="h-full w-full object-cover" />}
          </Link>
          <Link to={`/products/${item.productId}`} className="line-clamp-2 text-small font-medium text-slate-900 hover:text-brand-600 dark:text-white">
            {item.name}
          </Link>
          <PriceDisplay cents={item.priceCents} size="sm" />
          <Button variant="cta" size="sm" onClick={() => handleMoveToCart(item)}>
            Move to Cart
          </Button>
        </Card>
      ))}
    </div>
  );
}
