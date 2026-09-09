import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';

// Cosmetic only — no i18n framework, no content actually translates.
const LANGUAGES = ['EN', 'ES', 'FR'];
const STORAGE_KEY = 'language';

export default function LanguageSwitcher({ className = '' }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'EN';
    } catch (err) {
      return 'EN';
    }
  });
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const choose = (code) => {
    setLang(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch (err) {
      // best-effort only
    }
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
      >
        <Globe className="h-4 w-4" />
        {lang}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-24 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-elevated dark:border-slate-800 dark:bg-slate-900">
          {LANGUAGES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => choose(code)}
              className="block w-full px-3 py-1.5 text-left text-small text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {code}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
