import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';
import clsx from 'clsx';

/**
 * `images`: string[] (length >= 1). Real API products only ever have one
 * photo — the thumbnail rail simply doesn't render when there's nothing to
 * switch between, so a single-image product never shows a fake gallery.
 */
export default function ProductImageGallery({ images, alt }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const list = images && images.length ? images : [];

  if (list.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-300 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-600">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-16 w-16">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 14M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm9 4a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto sm:flex-col sm:overflow-visible">
          {list.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === active}
              className={clsx(
                'h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                i === active ? 'border-brand-600' : 'border-slate-200 dark:border-slate-700'
              )}
            >
              <img src={src} alt="" aria-hidden="true" className="h-full w-full object-cover" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setZoomed(true)}
        className="group relative flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800"
        aria-label="Zoom image"
      >
        <img src={list[active]} alt={alt} className="aspect-square w-full object-cover" />
        <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 opacity-0 shadow-soft transition-opacity group-hover:opacity-100 dark:bg-slate-900/90 dark:text-slate-300">
          <ZoomIn className="h-4 w-4" />
        </span>
      </button>

      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/90 p-4"
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions -- mouse-only dismiss layered on top of the visible keyboard-accessible Close button below
            onMouseDown={() => setZoomed(false)}
          >
            <button
              type="button"
              onClick={() => setZoomed(false)}
              aria-label="Close zoom"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- stops the backdrop's dismiss handler firing for clicks on the image itself */}
            <img
              src={list[active]}
              alt={alt}
              onMouseDown={(e) => e.stopPropagation()}
              className="max-h-full max-w-full rounded-lg object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
