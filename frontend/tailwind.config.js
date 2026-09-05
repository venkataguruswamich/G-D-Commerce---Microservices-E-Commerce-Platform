/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['InterVariable', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Derived from the G&D Commerce logo's navy, so every existing
        // brand-* usage (buttons, links, focus rings) picks up the brand
        // color without touching each component.
        brand: {
          50: '#eef4fb',
          100: '#dce8f6',
          200: '#b4cee9',
          300: '#82abd6',
          400: '#4f83bc',
          500: '#2f639f',
          600: '#1c4a7d',
          700: '#153a63',
          800: '#0f2c4c',
          900: '#0a1f37',
          950: '#071729',
        },
        // Logo's metallic gold, used sparingly as a secondary accent (sale
        // pricing, ratings, highlighted badges) — never as the primary
        // action color.
        accent: {
          50: '#fdf7ea',
          100: '#faedc9',
          200: '#f2d896',
          300: '#e8c065',
          400: '#d6a545',
          500: '#bd8a2e',
          600: '#9c7124',
          700: '#7a581c',
          800: '#5c4216',
          900: '#3d2c0f',
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
