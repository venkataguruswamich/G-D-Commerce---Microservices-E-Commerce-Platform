// Single seam between the real product-service API and the local demo
// catalog fallback (frontend/src/data/demoCatalog.js). Every storefront page
// should go through these functions rather than calling frontend/src/api/*
// directly, so the UI stays fully populated even when the backend is
// unreachable or sparsely seeded.
import { listProducts, getProduct } from '../api/products';
import { listCategories } from '../api/categories';
import { listOrders, getOrder } from '../api/orders';
import { demoCategories, demoProducts } from '../data/demoCatalog';

export async function getStorefrontCategories() {
  try {
    const cats = await listCategories();
    return cats && cats.length ? cats : demoCategories;
  } catch (err) {
    return demoCategories;
  }
}

function matchesSearch(product, search) {
  if (!search) return true;
  const needle = search.toLowerCase();
  return (
    product.name.toLowerCase().includes(needle) || (product.description || '').toLowerCase().includes(needle)
  );
}

const SORTERS = {
  price_asc: (a, b) => a.priceCents - b.priceCents,
  price_desc: (a, b) => b.priceCents - a.priceCents,
  name_asc: (a, b) => a.name.localeCompare(b.name),
  name_desc: (a, b) => b.name.localeCompare(a.name),
  newest: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
};

export function filterDemoProducts(params = {}) {
  const { search, categoryId, minPrice, maxPrice, sort = 'newest', page = 1, limit = 12 } = params;

  let items = demoProducts.filter((product) => {
    if (!matchesSearch(product, search)) return false;
    if (categoryId && product.categoryId !== categoryId) return false;
    if (minPrice != null && product.priceCents < Number(minPrice)) return false;
    if (maxPrice != null && product.priceCents > Number(maxPrice)) return false;
    return true;
  });

  const sorter = SORTERS[sort] || SORTERS.newest;
  items = [...items].sort(sorter);

  const total = items.length;
  const pageNum = Number(page) || 1;
  const pageSize = Number(limit) || 12;
  const start = (pageNum - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return { items: pageItems, total, page: pageNum, limit: pageSize };
}

export async function getStorefrontProducts(params) {
  try {
    const result = await listProducts(params);
    if (result && result.items && result.items.length > 0) return result;
    return filterDemoProducts(params);
  } catch (err) {
    return filterDemoProducts(params);
  }
}

export async function getStorefrontProduct(id) {
  try {
    return await getProduct(id);
  } catch (err) {
    const demo = demoProducts.find((p) => p.id === id);
    if (demo) return demo;
    throw err;
  }
}

export async function getFrequentlyReordered(limit = 8, { isAuthenticated } = {}) {
  if (!isAuthenticated) return demoProducts.slice(0, limit);

  try {
    const { items: orders } = await listOrders({ limit: 10 });
    const details = await Promise.all(orders.slice(0, 10).map((o) => getOrder(o.id).catch(() => null)));

    const productCounts = new Map();
    for (const order of details) {
      if (!order) continue;
      for (const item of order.items || []) {
        const entry = productCounts.get(item.productId) || { count: 0 };
        entry.count += item.quantity || 1;
        productCounts.set(item.productId, entry);
      }
    }

    const ranked = [...productCounts.entries()].sort((a, b) => b[1].count - a[1].count);
    if (ranked.length < 4) return demoProducts.slice(0, limit);

    const hydrated = await Promise.all(
      ranked.slice(0, limit).map(([productId]) => getStorefrontProduct(productId).catch(() => null))
    );
    const resolved = hydrated.filter(Boolean);
    return resolved.length >= 4 ? resolved : demoProducts.slice(0, limit);
  } catch (err) {
    return demoProducts.slice(0, limit);
  }
}
