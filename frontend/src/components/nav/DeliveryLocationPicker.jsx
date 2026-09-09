import React, { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';

const STORAGE_KEY = 'deliveryZip';

// Cosmetic only: no geocoding/carrier API behind this. It just persists a
// zip so the PDP delivery-estimate section (a later phase) can read the same
// `deliveryZip` localStorage key back.
export default function DeliveryLocationPicker({ className = '' }) {
  const [zip, setZip] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch (err) {
      return '';
    }
  });
  const [draft, setDraft] = useState(zip);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const save = (e) => {
    e.preventDefault();
    const trimmed = draft.trim();
    setZip(trimmed);
    try {
      if (trimmed) localStorage.setItem(STORAGE_KEY, trimmed);
      else localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      // localStorage unavailable — the picker still works for this session.
    }
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => {
          setDraft(zip);
          setOpen((v) => !v);
        }}
        className="flex flex-col items-start text-left text-slate-700 hover:text-brand-700 dark:text-slate-200 dark:hover:text-brand-400"
      >
        <span className="flex items-center gap-1 text-caption text-slate-500 dark:text-slate-400">
          <MapPin className="h-3.5 w-3.5" />
          Deliver to
        </span>
        <span className="text-small font-semibold">{zip || 'Add address'}</span>
      </button>

      {open && (
        <form
          onSubmit={save}
          className="absolute left-0 top-full z-30 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-4 shadow-elevated dark:border-slate-800 dark:bg-slate-900"
        >
          <label htmlFor="delivery-zip" className="mb-1 block text-label font-medium text-slate-600 dark:text-slate-300">
            ZIP or postal code
          </label>
          <input
            id="delivery-zip"
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. 94103"
            className="mb-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-body text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <button type="submit" className="w-full rounded-lg bg-brand-900 px-3 py-2 text-small font-medium text-white hover:bg-brand-950">
            Save
          </button>
        </form>
      )}
    </div>
  );
}
