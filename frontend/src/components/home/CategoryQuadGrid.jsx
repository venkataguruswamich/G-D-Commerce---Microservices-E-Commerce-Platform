import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../ui/Container';
import Card from '../ui/Card';

const UNSPLASH = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=400&q=80`;

// Curated sub-item tiles per category slug. Categories themselves are flat
// in the real backend (no subcategory concept) — these tiles are a
// presentation-layer grouping, linked via a `search` query param against
// real product names rather than a real taxonomy.
const THEMES = [
  {
    slug: 'electronics',
    title: 'Upgrade your tech',
    subtitle: 'Headphones, laptops, phones & more',
    items: [
      { label: 'Headphones', search: 'headphones', image: UNSPLASH('1505740420928-5e560c06d30e') },
      { label: 'Laptops', search: 'laptop', image: UNSPLASH('1496181133206-80ce9b88a853') },
      { label: 'Smartphones', search: 'smartphone', image: UNSPLASH('1511707171634-5f897ff02aa9') },
      { label: 'Smartwatches', search: 'smartwatch', image: UNSPLASH('1523275335684-37898b6baf30') },
    ],
  },
  {
    slug: 'home-kitchen',
    title: 'Upgrade your home',
    subtitle: 'Appliances, cookware, lighting & storage',
    items: [
      { label: 'Appliances', search: 'air fryer', image: UNSPLASH('1626074353765-517a681e40be') },
      { label: 'Cookware', search: 'cookware', image: UNSPLASH('1585515320310-259814833e62') },
      { label: 'Lighting', search: 'lamp', image: UNSPLASH('1507473885765-e6ed057f782c') },
      { label: 'Storage', search: 'storage', image: UNSPLASH('1600166898405-da9535204843') },
    ],
  },
];

export default function CategoryQuadGrid({ categories }) {
  const cards = THEMES.map((theme) => ({ ...theme, category: categories.find((c) => c.slug === theme.slug) })).filter(
    (t) => t.category
  );

  if (!cards.length) return null;

  return (
    <Container className="py-4">
      <div className="grid gap-6 sm:grid-cols-2">
        {cards.map((card) => (
          <Card key={card.slug} padding="md">
            <h3 className="mb-1 text-h4 font-semibold text-slate-900 dark:text-white">{card.title}</h3>
            <p className="mb-4 text-small text-slate-500 dark:text-slate-400">{card.subtitle}</p>
            <div className="grid grid-cols-2 gap-3">
              {card.items.map((item) => (
                <Link
                  key={item.label}
                  to={`/products?categoryId=${card.category.id}&search=${encodeURIComponent(item.search)}`}
                  className="group overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
                >
                  <div className="aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={item.image}
                      alt={item.label}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <p className="p-2 text-caption font-medium text-slate-700 dark:text-slate-200">{item.label}</p>
                </Link>
              ))}
            </div>
            <Link
              to={`/products?categoryId=${card.category.id}`}
              className="mt-4 inline-block text-small font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Shop now
            </Link>
          </Card>
        ))}
      </div>
    </Container>
  );
}
