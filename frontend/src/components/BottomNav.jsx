import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, User, LayoutGrid } from 'lucide-react';
import CategoryDrawer from './nav/CategoryDrawer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ITEM_CLASSES = 'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-caption font-medium';

export default function BottomNav() {
  const location = useLocation();
  const { totalItems } = useCart();
  const { isAuthenticated } = useAuth();

  const isActive = (path) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));
  const tone = (active) => (active ? 'text-brand-700 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400');

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-slate-800 dark:bg-slate-950 md:hidden"
      aria-label="Mobile navigation"
    >
      <Link to="/" className={`${ITEM_CLASSES} ${tone(isActive('/'))}`}>
        <Home className="h-5 w-5" />
        Home
      </Link>

      <CategoryDrawer className={`${ITEM_CLASSES} ${tone(false)}`}>
        <LayoutGrid className="h-5 w-5" />
        Categories
      </CategoryDrawer>

      <Link to="/cart" className={`${ITEM_CLASSES} ${tone(isActive('/cart'))}`}>
        <span className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">
              {totalItems}
            </span>
          )}
        </span>
        Cart
      </Link>

      <Link
        to={isAuthenticated ? '/account' : '/login'}
        className={`${ITEM_CLASSES} ${tone(isActive('/account') || isActive('/login'))}`}
      >
        <User className="h-5 w-5" />
        Profile
      </Link>
    </nav>
  );
}
