import React, { useEffect, useMemo, useState } from 'react';
import Container from '../components/ui/Container';
import HeroCarousel from '../components/home/HeroCarousel';
import CategoryQuadGrid from '../components/home/CategoryQuadGrid';
import ProductCarousel from '../components/home/ProductCarousel';
import CountdownTimer from '../components/home/CountdownTimer';
import { getStorefrontCategories, getStorefrontProducts, getFrequentlyReordered } from '../utils/catalog';
import { getMerchandising } from '../utils/merchandising';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

const BENEFITS = [
  {
    title: 'Secure checkout',
    description: 'Your payment details are never stored on our servers.',
    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
  },
  {
    title: 'Order tracking',
    description: 'Follow every order from confirmation to delivery.',
    icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 8h6m-6 4h6',
  },
  {
    title: 'Responsive support',
    description: 'Reach out any time — we’re here to help with your order.',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z',
  },
];

export default function Home() {
  useDocumentTitle();
  const { isAuthenticated } = useAuth();

  const [categories, setCategories] = useState([]);
  const [workingSet, setWorkingSet] = useState([]);
  const [electronics, setElectronics] = useState([]);
  const [homeKitchen, setHomeKitchen] = useState([]);
  const [reordered, setReordered] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const cats = await getStorefrontCategories().catch(() => []);
      if (cancelled) return;
      setCategories(cats);

      const electronicsCat = cats.find((c) => c.slug === 'electronics');
      const homeCat = cats.find((c) => c.slug === 'home-kitchen');

      const [all, elecResult, homeResult, freq] = await Promise.all([
        getStorefrontProducts({ limit: 60, sort: 'newest' }).catch(() => ({ items: [] })),
        electronicsCat
          ? getStorefrontProducts({ categoryId: electronicsCat.id, limit: 20 }).catch(() => ({ items: [] }))
          : Promise.resolve({ items: [] }),
        homeCat
          ? getStorefrontProducts({ categoryId: homeCat.id, limit: 20 }).catch(() => ({ items: [] }))
          : Promise.resolve({ items: [] }),
        getFrequentlyReordered(8, { isAuthenticated }).catch(() => []),
      ]);

      if (cancelled) return;
      setWorkingSet(all.items || []);
      setElectronics(elecResult.items || []);
      setHomeKitchen(homeResult.items || []);
      setReordered(freq);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const heroSlides = useMemo(() => {
    const electronicsCat = categories.find((c) => c.slug === 'electronics');
    const homeCat = categories.find((c) => c.slug === 'home-kitchen');
    return [
      {
        id: 'sale',
        eyebrow: "Today's Deals",
        title: 'Site-wide savings, every day',
        subtitle: 'Thousands of markdowns across Electronics and Home & Kitchen — for a limited time.',
        cta: 'Shop Deals',
        to: '/products',
      },
      {
        id: 'electronics',
        eyebrow: 'Electronics',
        title: 'Next-gen tech for less',
        subtitle: 'Headphones, laptops, smartphones, and more — all backed by our 7-day replacement guarantee.',
        cta: 'Shop Electronics',
        to: electronicsCat ? `/products?categoryId=${electronicsCat.id}` : '/products',
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1600&q=80',
      },
      {
        id: 'home',
        eyebrow: 'Home & Kitchen',
        title: 'Refresh your space',
        subtitle: 'Cookware, lighting, and appliances to make your home feel brand new.',
        cta: 'Shop Home & Kitchen',
        to: homeCat ? `/products?categoryId=${homeCat.id}` : '/products',
        image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=1600&q=80',
      },
    ];
  }, [categories]);

  const dealsOfTheDay = useMemo(() => {
    const withMerch = workingSet.map((p) => ({ product: p, merch: getMerchandising(p) }));
    const deals = withMerch.filter((x) => x.merch.badges.isDeal).sort((a, b) => b.merch.discountPercent - a.merch.discountPercent);
    const pool = deals.length >= 4 ? deals : withMerch.sort((a, b) => b.merch.discountPercent - a.merch.discountPercent);
    return pool.slice(0, 8).map((x) => x.product);
  }, [workingSet]);

  const bestSellersElectronics = useMemo(() => {
    return [...electronics]
      .sort((a, b) => getMerchandising(b).rating - getMerchandising(a).rating)
      .slice(0, 8);
  }, [electronics]);

  const trendingHomeKitchen = useMemo(() => {
    return [...homeKitchen]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, [homeKitchen]);

  return (
    <div>
      <HeroCarousel slides={heroSlides} />

      <CategoryQuadGrid categories={categories} />

      <ProductCarousel
        eyebrow="Limited time"
        title="Deals of the Day"
        viewAllHref="/products"
        products={dealsOfTheDay}
        loading={loading}
        right={<CountdownTimer />}
      />

      <ProductCarousel
        eyebrow="Highly rated"
        title="Best Sellers in Electronics"
        viewAllHref={categories.find((c) => c.slug === 'electronics') ? `/products?categoryId=${categories.find((c) => c.slug === 'electronics').id}` : '/products'}
        products={bestSellersElectronics}
        loading={loading}
      />

      <ProductCarousel
        eyebrow="Just landed"
        title="Trending in Home & Kitchen"
        viewAllHref={categories.find((c) => c.slug === 'home-kitchen') ? `/products?categoryId=${categories.find((c) => c.slug === 'home-kitchen').id}` : '/products'}
        products={trendingHomeKitchen}
        loading={loading}
      />

      <ProductCarousel
        eyebrow={isAuthenticated ? 'Based on your orders' : 'Customer favorites'}
        title="Frequently Re-ordered Items"
        viewAllHref="/products"
        products={reordered}
        loading={loading}
      />

      <section className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">
        <Container className="grid grid-cols-1 gap-8 py-12 sm:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d={benefit.icon} />
                </svg>
              </div>
              <h3 className="text-h4 font-semibold text-slate-900 dark:text-white">{benefit.title}</h3>
              <p className="max-w-xs text-small text-slate-500 dark:text-slate-400">{benefit.description}</p>
            </div>
          ))}
        </Container>
      </section>
    </div>
  );
}
