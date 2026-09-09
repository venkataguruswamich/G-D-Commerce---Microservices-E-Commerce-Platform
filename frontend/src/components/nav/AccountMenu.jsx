import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ITEM_CLASSES =
  'block px-4 py-2 text-small text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800';

export default function AccountMenu({ className = '' }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-brand-700 dark:text-slate-200 dark:hover:text-brand-400"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">{isAuthenticated ? `Hello, ${user.firstName}` : 'Account & Lists'}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-elevated dark:border-slate-800 dark:bg-slate-900">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/admin" onClick={() => setOpen(false)} className={ITEM_CLASSES}>
                  Admin Dashboard
                </Link>
              )}
              <Link to="/account" onClick={() => setOpen(false)} className={ITEM_CLASSES}>
                Your Account
              </Link>
              <Link to="/account/orders" onClick={() => setOpen(false)} className={ITEM_CLASSES}>
                Your Orders
              </Link>
              <Link to="/account/wishlist" onClick={() => setOpen(false)} className={ITEM_CLASSES}>
                Your Wishlist
              </Link>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              <button type="button" onClick={handleLogout} className={`w-full text-left ${ITEM_CLASSES}`}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className={ITEM_CLASSES}>
                Sign In
              </Link>
              <Link to="/register" onClick={() => setOpen(false)} className={ITEM_CLASSES}>
                New customer? Register
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
