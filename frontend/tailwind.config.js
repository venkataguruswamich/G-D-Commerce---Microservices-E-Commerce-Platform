/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['InterVariable', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // G&D Commerce brand navy, anchored to the exact "Royal Deep Navy"
        // spec (#0d2040 = brand-900) — every existing brand-* usage
        // (buttons, links, focus rings) picks up the brand color without
        // touching each component. Conversion CTAs use Tailwind's built-in
        // amber-* (amber-500 is already #f59e0b, no custom scale needed).
        brand: {
          50: '#eef3fb',
          100: '#dde7f8',
          200: '#bbcff1',
          300: '#91b1e9',
          400: '#5e8dde',
          500: '#2b69d4',
          600: '#2354a9',
          700: '#1a3f7f',
          800: '#132e5d',
          900: '#0d2040',
          950: '#09152a',
        },
        // Logo's metallic gold, anchored to the exact "Warm Metallic Gold"
        // spec (#d4af37 = accent-500), used sparingly as a secondary accent
        // (sale pricing, ratings, highlighted badges, "Buy Now" trim) —
        // never as the primary conversion action color.
        accent: {
          50: '#fbf7ea',
          100: '#f4ebcd',
          200: '#ebdaa3',
          300: '#e2c979',
          400: '#dbbc57',
          500: '#d4af37',
          600: '#b09026',
          700: '#866e1d',
          800: '#655216',
          900: '#43370e',
        },
        // Semantic status colors, used by Badge/status pills/toasts/alerts so
        // those components read `bg-success-50 text-success-700` instead of
        // ad hoc hex values scattered across the app.
        success: { 50: '#f0fdf4', 100: '#dcfce7', 600: '#16a34a', 700: '#15803d' },
        warning: { 50: '#fffbeb', 100: '#fef3c7', 600: '#d97706', 700: '#b45309' },
        danger: { 50: '#fef2f2', 100: '#fee2e2', 600: '#dc2626', 700: '#b91c1c' },
        info: { 50: '#eff6ff', 100: '#dbeafe', 600: '#2563eb', 700: '#1d4ed8' },
      },
      // Named type scale (Display/H1-H4/Body/Small/Caption/Label) so page
      // markup picks a role — `text-h2`, `text-caption` — instead of
      // freehanding arbitrary sizes per component.
      fontSize: {
        display: ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        h1: ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        h2: ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        h3: ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        h4: ['1.25rem', { lineHeight: '1.35' }],
        body: ['1rem', { lineHeight: '1.6' }],
        small: ['0.875rem', { lineHeight: '1.5' }],
        caption: ['0.75rem', { lineHeight: '1.4' }],
        label: ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(15, 23, 42, 0.08), 0 4px 16px -4px rgba(15, 23, 42, 0.06)',
        elevated: '0 8px 24px -6px rgba(15, 23, 42, 0.16), 0 12px 40px -8px rgba(15, 23, 42, 0.12)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.2s linear infinite',
      },
    },
  },
  plugins: [],
};
