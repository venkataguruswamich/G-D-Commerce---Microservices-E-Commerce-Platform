import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ThemeToggle from './ui/ThemeToggle';
import Button from './ui/Button';
import Container from './ui/Container';
import logoIcon from '../assets/brand/logo-icon.png';

const NAV_LINK_CLASSES =
  'text-sm font-medium text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400';

export default function Navigation() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    setMobileOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50">
      <nav
        className={`transition-all duration-300 ${
          scrolled
            ? 'border-b border-white/40 bg-white/75 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70'
            : 'border-b border-transparent bg-white/40 backdrop-blur-md dark:bg-slate-950/30'
        }`}
      >
        <Container className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2" aria-label="G&D Commerce home">
            <img src={logoIcon} alt="" aria-hidden="true" className="h-8 w-8 object-contain sm:h-9 sm:w-9" />
            <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">G&amp;D Commerce</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link to="/products" className={NAV_LINK_CLASSES}>
              Products
            </Link>
            <Link to="/categories" className={NAV_LINK_CLASSES}>
              Categories
            </Link>
            <Link to="/cart" className={`relative ${NAV_LINK_CLASSES}`}>
              Cart
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    className="absolute -right-3 -top-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/orders" className={NAV_LINK_CLASSES}>
                  Orders
                </Link>
                <Link to="/status" className={NAV_LINK_CLASSES}>
                  Track order
                </Link>
                <Link to="/profile" className={NAV_LINK_CLASSES}>
                  Profile
                </Link>
                {isAdmin && (
                  <Link to="/admin" className={NAV_LINK_CLASSES}>
                    Admin
                  </Link>
                )}
                <span className="text-sm text-slate-500 dark:text-slate-400">Hi, {user.firstName}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className={NAV_LINK_CLASSES}>
                  Login
                </Link>
                <Button to="/register" size="sm">
                  Register
                </Button>
              </>
            )}

            <ThemeToggle />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </Container>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-white/40 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 md:hidden"
            >
              <Container className="flex flex-col gap-4 py-4">
                <Link to="/products" className={NAV_LINK_CLASSES} onClick={() => setMobileOpen(false)}>
                  Products
                </Link>
                <Link to="/categories" className={NAV_LINK_CLASSES} onClick={() => setMobileOpen(false)}>
                  Categories
                </Link>
                <Link to="/cart" className={NAV_LINK_CLASSES} onClick={() => setMobileOpen(false)}>
                  Cart ({totalItems})
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link to="/orders" className={NAV_LINK_CLASSES} onClick={() => setMobileOpen(false)}>
                      Orders
                    </Link>
                    <Link to="/status" className={NAV_LINK_CLASSES} onClick={() => setMobileOpen(false)}>
                      Track order
                    </Link>
                    <Link to="/profile" className={NAV_LINK_CLASSES} onClick={() => setMobileOpen(false)}>
                      Profile
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className={NAV_LINK_CLASSES} onClick={() => setMobileOpen(false)}>
                        Admin
                      </Link>
                    )}
                    <span className="text-sm text-slate-500 dark:text-slate-400">Hi, {user.firstName}</span>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="self-start">
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className={NAV_LINK_CLASSES} onClick={() => setMobileOpen(false)}>
                      Login
                    </Link>
                    <Button to="/register" size="sm" className="self-start" onClick={() => setMobileOpen(false)}>
                      Register
                    </Button>
                  </>
                )}
              </Container>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
