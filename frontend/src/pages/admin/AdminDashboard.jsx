import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../../components/ui/Container';
import Card from '../../components/ui/Card';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const SECTIONS = [
  {
    to: '/admin/products',
    title: 'Products',
    description: 'Create, edit, and manage inventory for the catalog.',
    icon: 'M20 7 12 3 4 7m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  {
    to: '/admin/orders',
    title: 'Orders',
    description: 'Review orders and update fulfillment status.',
    icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 8h6m-6 4h6',
  },
  {
    to: '/admin/users',
    title: 'Users',
    description: 'View registered customers and their account status.',
    icon: 'M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m5-8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm6 3a4 4 0 1 1-8 0',
  },
];

export default function AdminDashboard() {
  useDocumentTitle('Admin Dashboard');
  return (
    <Container className="py-8">
      <h1 className="mb-6 text-h2 font-semibold text-slate-900 dark:text-white">Admin Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link key={section.to} to={section.to}>
            <Card padding="lg" className="h-full transition-shadow hover:shadow-elevated">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="mb-3 h-7 w-7 text-brand-600 dark:text-brand-400">
                <path strokeLinecap="round" strokeLinejoin="round" d={section.icon} />
              </svg>
              <h2 className="text-h4 font-semibold text-slate-900 dark:text-white">{section.title}</h2>
              <p className="mt-1 text-small text-slate-500 dark:text-slate-400">{section.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </Container>
  );
}
