import React from 'react';
import Navigation from './Navigation';

// Navigation renders its own <header> (it needs the wrapper to be `sticky`),
// so this component is just a thin re-export kept for import-path stability
// — anything importing `components/Header` still works unchanged.
export default function Header() {
  return <Navigation />;
}
