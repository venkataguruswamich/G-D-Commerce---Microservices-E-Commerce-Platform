import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Container from './ui/Container';
import logoIcon from '../assets/brand/logo-icon.png';

const COLUMNS = [
  {
    title: 'Get to Know Us',
    items: [{ label: 'About G&D Commerce' }, { label: 'Careers' }, { label: 'Press' }],
  },
  {
    title: 'Let Us Help You',
    items: [
      { label: 'Your Account', to: '/account' },
      { label: 'Your Orders', to: '/account/orders' },
      { label: 'Shipping & Returns' },
      { label: 'Contact Us' },
    ],
  },
  {
    title: 'Shop With Us',
    items: [
      { label: 'All Products', to: '/products' },
      { label: "Today's Deals", to: '/products?deal=true' },
      { label: 'Categories', to: '/products' },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full bg-brand-900 py-3 text-center text-small font-medium text-white transition-colors hover:bg-brand-950"
      >
        Back to top
      </button>

      <Container className="grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 text-small font-semibold text-slate-900 dark:text-white">{col.title}</h3>
            <ul className="flex flex-col gap-2">
              {col.items.map((item) =>
                item.to ? (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-caption text-slate-600 hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-400"
                    >
                      {item.label}
                    </Link>
                  </li>
                ) : (
                  <li key={item.label} className="text-caption text-slate-500 dark:text-slate-500">
                    {item.label}
                  </li>
                )
              )}
            </ul>
          </div>
        ))}

        <div>
          <Link to="/" className="mb-3 flex items-center gap-2">
            <img src={logoIcon} alt="" aria-hidden="true" className="h-6 w-6 object-contain dark:brightness-125" />
            <span className="text-small font-semibold text-slate-900 dark:text-white">G&amp;D Commerce</span>
          </Link>
          <p className="mb-3 text-caption text-slate-500 dark:text-slate-400">Global Solutions • Reliable Partners</p>
          {subscribed ? (
            <p className="text-caption font-medium text-success-700 dark:text-success-600">Thanks for subscribing!</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                aria-label="Email for newsletter"
                className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-caption text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-caption font-semibold text-brand-950 hover:bg-amber-600"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </Container>

      <div className="border-t border-slate-200 dark:border-slate-800">
        <Container className="flex flex-col items-center gap-2 py-6 text-center text-caption text-slate-500 dark:text-slate-400 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <img src={logoIcon} alt="" aria-hidden="true" className="h-5 w-5 object-contain dark:brightness-125" />
            <span>&copy; {new Date().getFullYear()} G&amp;D Commerce.</span>
          </div>
          <p>Demo application — no real payments.</p>
        </Container>
      </div>
    </footer>
  );
}
