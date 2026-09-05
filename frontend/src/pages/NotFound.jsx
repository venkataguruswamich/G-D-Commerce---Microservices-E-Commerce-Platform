import React from 'react';
import Container from '../components/ui/Container';
import EmptyState from '../components/ui/EmptyState';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <Container className="py-16">
      <EmptyState icon="search" title="404 — Page not found" description="The page you're looking for doesn't exist." action={{ label: 'Return home', to: '/' }} />
    </Container>
  );
}
