import React from 'react';
import Container from './ui/Container';
import logoIcon from '../assets/brand/logo-icon.png';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <Container className="flex flex-col items-center gap-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        <img src={logoIcon} alt="" aria-hidden="true" className="h-6 w-6 object-contain dark:brightness-125" />
        <p>&copy; {new Date().getFullYear()} G&amp;D Commerce. Demo application — no real payments.</p>
      </Container>
    </footer>
  );
}
