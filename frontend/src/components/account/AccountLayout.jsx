import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Heart, MapPin, CreditCard, UserCog } from 'lucide-react';
import Container from '../ui/Container';

const NAV_ITEMS = [
  { to: '/account', label: 'Overview', end: true, icon: LayoutDashboard },
  { to: '/account/orders', label: 'Orders & Tracking', icon: Package },
  { to: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
  { to: '/account/payment-methods', label: 'Payment Methods', icon: CreditCard },
  { to: '/account/profile', label: 'Profile & Security', icon: UserCog },
];

const LINK_BASE = 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-small font-medium transition-colors whitespace-nowrap';
const LINK_INACTIVE = 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800';
const LINK_ACTIVE = 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400';

/**
 * Visually modeled on components/admin/AdminLayout.jsx's sidebar shell, but
 * not shared/imported — account and admin stay independent surfaces. Unlike
 * AdminLayout, this does NOT replace the storefront Header/Footer/BottomNav;
 * App.jsx just wraps page content with this sidebar layout on /account/*.
 */
export default function AccountLayout({ children }) {
  return (
    <Container className="py-8">
      <h1 className="mb-6 text-h2 font-semibold text-slate-900 dark:text-white">Your Account</h1>
      <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
        <nav
          aria-label="Account navigation"
          className="mb-6 -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:mb-0 lg:flex-col lg:overflow-visible lg:px-0"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `${LINK_BASE} ${isActive ? LINK_ACTIVE : LINK_INACTIVE}`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
