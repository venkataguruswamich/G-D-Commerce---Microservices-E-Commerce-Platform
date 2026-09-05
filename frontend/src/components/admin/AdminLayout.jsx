import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import logoIcon from '../../assets/brand/logo-icon.png';

const NAV_ITEMS = [
  {
    to: '/admin',
    label: 'Dashboard',
    end: true,
    icon: 'M3 12 12 3l9 9M4.5 10.5V20a1 1 0 0 0 1 1H9.5v-6h5v6H19a1 1 0 0 0 1-1v-9.5',
  },
  {
    to: '/admin/products',
    label: 'Products',
    icon: 'M20 7 12 3 4 7m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  {
    to: '/admin/categories',
    label: 'Categories',
    icon: 'M20.59 13.41 11 3.83A2 2 0 0 0 9.57 3H4a1 1 0 0 0-1 1v5.57a2 2 0 0 0 .83 1.42l9.58 9.59a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83ZM7 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z',
  },
  {
    to: '/admin/orders',
    label: 'Orders',
    icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 8h6m-6 4h6',
  },
  {
    to: '/admin/inventory',
    label: 'Inventory',
    icon: 'M20 7 12 3 4 7v10l8 4 8-4V7ZM4 7l8 4m0 0 8-4m-8 4v10',
  },
  {
    to: '/admin/payments',
    label: 'Payments',
    icon: 'M2 10h20M6 15h4M2 6h20a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z',
  },
  {
    to: '/admin/users',
    label: 'Customers',
    icon: 'M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m5-8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm6 3a4 4 0 1 1-8 0',
  },
];

const NAV_LINK_BASE =
  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors';
const NAV_LINK_INACTIVE = 'text-slate-300 hover:bg-white/5 hover:text-white';
const NAV_LINK_ACTIVE = 'bg-white/10 text-white';

function SidebarNav({ onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4" aria-label="Admin navigation">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) => `${NAV_LINK_BASE} ${isActive ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE} relative`}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent-400" aria-hidden="true" />
              )}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activeItem = NAV_ITEMS.find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)));

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-brand-950 lg:flex">
        <Link to="/" className="flex items-center gap-2 px-5 py-5" aria-label="G&D Commerce home">
          <img src={logoIcon} alt="" aria-hidden="true" className="h-8 w-8 object-contain" />
          <span className="text-base font-semibold tracking-tight text-white">G&amp;D Commerce</span>
        </Link>
        <SidebarNav />
        <div className="border-t border-white/10 px-3 py-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19v-6h4v6m-9-9 8-6 8 6v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
            </svg>
            Back to store
          </Link>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-brand-950 lg:hidden"
            >
              <div className="flex items-center justify-between px-5 py-5">
                <Link to="/" className="flex items-center gap-2" aria-label="G&D Commerce home">
                  <img src={logoIcon} alt="" aria-hidden="true" className="h-8 w-8 object-contain" />
                  <span className="text-base font-semibold tracking-tight text-white">G&amp;D Commerce</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="rounded-full p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
              <div className="border-t border-white/10 px-3 py-4">
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19v-6h4v6m-9-9 8-6 8 6v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
                  </svg>
                  Back to store
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-h4 font-semibold text-slate-900 dark:text-white">{activeItem?.label || 'Admin'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-small text-slate-500 dark:text-slate-400 sm:inline">Hi, {user?.firstName}</span>
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-small font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </header>

        <main id="main-content" className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
