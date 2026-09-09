import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ThemeToggle from './ui/ThemeToggle';
import Container from './ui/Container';
import SearchBar from './nav/SearchBar';
import DeliveryLocationPicker from './nav/DeliveryLocationPicker';
import AccountMenu from './nav/AccountMenu';
import CategoryDrawer from './nav/CategoryDrawer';
import CartDrawer from './nav/CartDrawer';
import LanguageSwitcher from './nav/LanguageSwitcher';
import logoIcon from '../assets/brand/logo-icon.png';

const NAV_LINK_CLASSES =
  'text-sm font-medium text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400';

const SUB_NAV_LINKS = [
  { to: '/products?deal=true', label: "Today's Deals" },
  { to: '/products?sort=featured', label: 'Best Sellers' },
  { to: '/contact', label: 'Customer Service' },
];

export default function Navigation() {
  const { totalItems } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <nav
        className={`transition-all duration-300 ${
          scrolled
            ? 'border-b border-white/40 bg-white/75 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70'
            : 'border-b border-transparent bg-white/40 backdrop-blur-md dark:bg-slate-950/30'
        }`}
      >
        <Container className="flex h-16 items-center gap-3">
          <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="G&D Commerce home">
            <img src={logoIcon} alt="" aria-hidden="true" className="h-8 w-8 object-contain sm:h-9 sm:w-9" />
            <span className="hidden text-lg font-semibold tracking-tight text-slate-900 dark:text-white sm:inline">
              G&amp;D Commerce
            </span>
          </Link>

          <DeliveryLocationPicker className="hidden shrink-0 sm:flex" />

          <SearchBar className="hidden flex-1 md:block" />

          <button
            type="button"
            onClick={() => setMobileSearchOpen((v) => !v)}
            aria-label="Toggle search"
            aria-expanded={mobileSearchOpen}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
          >
            <SearchIcon className="h-5 w-5" />
          </button>

          <LanguageSwitcher className="hidden shrink-0 lg:flex" />

          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <AccountMenu />
            <Link to="/account/orders" className={`hidden shrink-0 ${NAV_LINK_CLASSES} md:inline`}>
              Returns &amp; Orders
            </Link>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Cart, ${totalItems} items`}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ShoppingCart className="h-5 w-5" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <ThemeToggle className="hidden sm:inline-flex" />
          </div>
        </Container>

        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-white/40 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 md:hidden"
            >
              <Container className="py-3">
                <SearchBar />
              </Container>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="border-t border-white/40 bg-white/60 dark:border-white/10 dark:bg-slate-950/40">
          <Container className="flex items-center gap-5 overflow-x-auto whitespace-nowrap py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <CategoryDrawer className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-slate-800 hover:text-brand-700 dark:text-slate-100 dark:hover:text-brand-400" />
            {SUB_NAV_LINKS.map((link) => (
              <Link key={link.label} to={link.to} className={`shrink-0 ${NAV_LINK_CLASSES}`}>
                {link.label}
              </Link>
            ))}
            <Link to="/products" className={`shrink-0 ${NAV_LINK_CLASSES} sm:hidden`}>
              All Products
            </Link>
          </Container>
        </div>
      </nav>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
