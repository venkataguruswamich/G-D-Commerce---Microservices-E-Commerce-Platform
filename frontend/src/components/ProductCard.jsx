import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import clsx from 'clsx';
import PriceDisplay from './ui/PriceDisplay';
import RatingStars from './ui/RatingStars';
import Button from './ui/Button';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getMerchandising } from '../utils/merchandising';

export default function ProductCard({ product }) {
  const merch = getMerchandising(product);
  const { addItem } = useCart();
  const { isWishlisted, toggleItem } = useWishlist();
  const [hovering, setHovering] = useState(false);
  const wishlisted = isWishlisted(product.id);
  const showSecondImage = hovering && merch.images.length > 1;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  };

  return (
    <Link
      to={`/products/${product.id}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow duration-200 hover:shadow-elevated dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
        {merch.images[0] ? (
          <>
            <img
              src={merch.images[0]}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className={clsx(
                'h-full w-full object-cover transition-opacity duration-300 ease-out',
                showSecondImage ? 'opacity-0' : 'opacity-100'
              )}
            />
            {merch.images.length > 1 && (
              <img
                src={merch.images[1]}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className={clsx(
                  'absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-out',
                  showSecondImage ? 'opacity-100' : 'opacity-0'
                )}
              />
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 14M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm9 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
            </svg>
          </div>
        )}

        {merch.discountPercent > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-danger-600 px-2 py-0.5 text-caption font-semibold text-white">
            -{merch.discountPercent}% OFF
          </span>
        )}
        {merch.badges.isDeal && (
          <span className="absolute bottom-2 left-2 rounded-full bg-amber-500 px-2 py-0.5 text-caption font-semibold text-brand-950">
            Limited time deal
          </span>
        )}

        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wishlisted}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-soft transition-colors hover:text-danger-600 dark:bg-slate-900/90 dark:text-slate-300"
        >
          <Heart className={clsx('h-4 w-4', wishlisted && 'fill-danger-600 text-danger-600')} />
        </button>
      </div>

      <div className="flex flex-col gap-1 p-4">
        {product.categoryName && (
          <span className="text-caption font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {product.categoryName}
          </span>
        )}
        <span className="text-caption text-slate-500 dark:text-slate-400">{merch.brand}</span>
        <h3 className="line-clamp-2 text-small font-medium text-slate-900 dark:text-white">{product.name}</h3>
        <RatingStars rating={merch.rating} reviewCount={merch.reviewCount} size="sm" />
        <PriceDisplay
          cents={product.priceCents}
          currency={product.currency}
          size="sm"
          className="mt-1"
          mrpCents={merch.mrpCents}
          discountPercent={merch.discountPercent}
        />

        <div className="mt-2 flex gap-2 opacity-100 transition-opacity duration-150 md:opacity-0 md:group-hover:opacity-100">
          <Button variant="cta" size="sm" onClick={handleAddToCart} className="flex-1">
            Add to Cart
          </Button>
        </div>
      </div>
    </Link>
  );
}
