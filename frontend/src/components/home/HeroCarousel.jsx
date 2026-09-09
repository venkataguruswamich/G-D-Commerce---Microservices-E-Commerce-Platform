import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import Container from '../ui/Container';
import Button from '../ui/Button';

const AUTOPLAY_MS = 5500;

/**
 * `slides`: [{ id, eyebrow, title, subtitle, cta, to, image (optional URL) }].
 * Autoplays, pauses on hover/focus, supports arrow + dot navigation.
 */
export default function HeroCarousel({ slides }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  if (!slides.length) return null;
  const slide = slides[index];

  const go = (delta) => setIndex((i) => (i + delta + slides.length) % slides.length);

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative flex h-[360px] w-full items-center bg-cover bg-center sm:h-[440px]"
          style={{
            backgroundImage: slide.image
              ? `linear-gradient(90deg, rgba(13,32,64,0.94) 0%, rgba(13,32,64,0.55) 60%, rgba(13,32,64,0.25) 100%), url(${slide.image})`
              : 'linear-gradient(120deg, #0d2040 0%, #1a3f7f 100%)',
          }}
        >
          <Container className="flex flex-col items-start gap-4">
            <p className="text-caption font-semibold uppercase tracking-[0.22em] text-accent-400">{slide.eyebrow}</p>
            <h2 className="max-w-xl text-h1 font-bold text-white sm:text-display">{slide.title}</h2>
            <p className="max-w-md text-body text-slate-200">{slide.subtitle}</p>
            <Button to={slide.to} variant="cta" size="lg" className="mt-2">
              {slide.cta}
            </Button>
          </Container>
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={clsx('h-2 rounded-full transition-all', i === index ? 'w-6 bg-white' : 'w-2 bg-white/50')}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
