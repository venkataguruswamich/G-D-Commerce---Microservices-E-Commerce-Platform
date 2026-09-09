import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Cpu, UtensilsCrossed, Package, Flame, Award, Sparkles, Headphones } from 'lucide-react';
import Drawer from '../ui/Drawer';
import { getStorefrontCategories } from '../../utils/catalog';

const STATIC_LINKS = [
  { to: '/products?deal=true', label: "Today's Deals", icon: Flame },
  { to: '/products?sort=featured', label: 'Best Sellers', icon: Award },
  { to: '/products?sort=newest', label: 'New Releases', icon: Sparkles },
  { to: '/contact', label: 'Customer Service', icon: Headphones },
];

function iconFor(name = '') {
  const lower = name.toLowerCase();
  if (lower.includes('electronic')) return Cpu;
  if (lower.includes('home') || lower.includes('kitchen')) return UtensilsCrossed;
  return Package;
}

/**
 * The "All" hamburger mega-menu. `children` lets callers customize the
 * trigger (Navigation's inline "All" link vs. BottomNav's stacked
 * icon+label) without this component caring how it's presented.
 */
export default function CategoryDrawer({ children, className = '' }) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (open && categories.length === 0) {
      getStorefrontCategories()
        .then(setCategories)
        .catch(() => {});
    }
  }, [open, categories.length]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children || (
          <>
            <Menu className="h-4 w-4" />
            All
          </>
        )}
      </button>

      <Drawer isOpen={open} onClose={() => setOpen(false)} side="left" title="Shop by Category">
        <nav className="flex flex-col gap-1">
          {STATIC_LINKS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-small font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <item.icon className="h-4 w-4 text-brand-700 dark:text-brand-400" />
              {item.label}
            </Link>
          ))}
          <div className="my-2 border-t border-slate-100 dark:border-slate-800" />
          <p className="px-3 pb-1 text-label font-semibold uppercase tracking-wide text-slate-400">Shop by Category</p>
          {categories.map((c) => {
            const Icon = iconFor(c.name);
            return (
              <Link
                key={c.id}
                to={`/products?categoryId=${c.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-small text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Icon className="h-4 w-4 text-slate-400" />
                {c.name}
              </Link>
            );
          })}
        </nav>
      </Drawer>
    </>
  );
}
