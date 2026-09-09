// The real Product model (services/product-service) has no rating, review,
// discount/MRP, multi-image gallery, brand, or spec fields — this module is
// the ONLY place in the app that invents that merchandising presentation
// layer. Every value is deterministic per product id (seeded hash, never
// `Math.random()`), so the same product always renders the same "fake but
// stable" rating/discount/badges across renders, reloads, and sessions.

function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

function channelHash(id, channel) {
  return hashString(`${id}:${channel}`);
}

const DISCOUNT_OPTIONS = [0, 0, 10, 15, 20, 25, 30];

const BRAND_POOLS = {
  electronics: ['Zenlite', 'Voltrix', 'NimbusTech', 'Orbitalis', 'Kryon', 'Wavelength'],
  home: ['Hearthwood', 'CasaVerde', 'Lumora', 'KitchenCraft Co.', 'Nestwell', 'Copperline'],
  default: ['Threadloom', 'Urbanica', 'Wovenly', 'Northfold', 'Merigold'],
};

const ELECTRONICS_COLORS = ['Midnight Black', 'Slate Gray', 'Arctic White', 'Navy Blue'];
const HOME_MATERIALS = ['Stainless Steel', 'BPA-Free Plastic', 'Tempered Glass', 'Solid Wood'];
const CLOTHING_MATERIALS = ['100% Cotton', 'Cotton Blend', 'Polyester'];

function resolveCategoryGroup(categoryName = '') {
  const name = categoryName.toLowerCase();
  if (name.includes('electronic')) return 'electronics';
  if (name.includes('home') || name.includes('kitchen')) return 'home';
  if (name.includes('cloth')) return 'clothing';
  return 'default';
}

function pick(options, seed) {
  return options[seed % options.length];
}

function getBrand(product, group) {
  const pool = BRAND_POOLS[group] || BRAND_POOLS.default;
  return pick(pool, channelHash(product.id, 'brand'));
}

function getSpecs(product, group, brand) {
  const idHash = channelHash(product.id, 'specs');
  const warranty = {
    electronics: '1 Year Limited Warranty',
    home: '2 Year Limited Warranty',
  }[group] || '30-Day Returns';

  if (group === 'electronics') {
    const initials = brand
      .split(/\s+/)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
    return {
      Brand: brand,
      'Model Number': `${initials}-${1000 + (idHash % 9000)}`,
      Color: pick(ELECTRONICS_COLORS, idHash),
      Warranty: warranty,
    };
  }

  if (group === 'home') {
    const w = (10 + (idHash % 15)) + (idHash % 10) / 10;
    const d = (6 + ((idHash >>> 3) % 10)) + ((idHash >>> 3) % 10) / 10;
    const h = (4 + ((idHash >>> 6) % 12)) + ((idHash >>> 6) % 10) / 10;
    return {
      Brand: brand,
      Material: pick(HOME_MATERIALS, idHash),
      Dimensions: `${w.toFixed(1)}" x ${d.toFixed(1)}" x ${h.toFixed(1)}"`,
      Warranty: warranty,
    };
  }

  return {
    Brand: brand,
    Material: pick(CLOTHING_MATERIALS, idHash),
    'Care Instructions': 'Machine wash cold',
    Warranty: warranty,
  };
}

export function getMerchandising(product, { inventory } = {}) {
  const id = product.id;
  const group = resolveCategoryGroup(product.categoryName);

  const rating = Math.min(5, 3.5 + (channelHash(id, 'rating') % 16) / 10);
  const reviewCount = 12 + (channelHash(id, 'reviews') % 1789);

  const discountPercent = pick(DISCOUNT_OPTIONS, channelHash(id, 'discount'));
  const mrpCents = discountPercent > 0 ? Math.round(product.priceCents / (1 - discountPercent / 100)) : null;
  const savingsCents = mrpCents ? mrpCents - product.priceCents : 0;

  const badges = {
    isDeal: discountPercent >= 20,
    isBestSeller: channelHash(id, 'bestseller') % 5 === 0,
    isNew: channelHash(id, 'new') % 7 === 0,
  };

  const brand = getBrand(product, group);
  const specs = getSpecs(product, group, brand);

  const images = product._demoImages && product._demoImages.length ? product._demoImages : [product.imageUrl].filter(Boolean);

  const deliveryHash = channelHash(id, 'delivery');
  const deliveryDays = deliveryHash % 3 === 0 ? 1 + (deliveryHash % 2) : 3 + (deliveryHash % 5);
  const isPrimeEligible = deliveryDays <= 2;

  let inStock = true;
  let stockQty = null;
  if (inventory && Object.prototype.hasOwnProperty.call(inventory, id)) {
    const entry = inventory[id];
    stockQty = Math.max(0, (entry?.quantity || 0) - (entry?.reserved || 0));
    inStock = stockQty > 0;
  }

  return {
    rating: Number(rating.toFixed(1)),
    reviewCount,
    discountPercent,
    mrpCents,
    savingsCents,
    badges,
    brand,
    images,
    specs,
    deliveryDays,
    isPrimeEligible,
    inStock,
    stockQty,
  };
}

const REVIEW_AUTHORS = [
  'Alex R.', 'Jamie T.', 'Morgan K.', 'Sam P.', 'Taylor B.', 'Jordan M.', 'Casey L.', 'Riley S.',
  'Drew H.', 'Avery C.', 'Cameron W.', 'Quinn D.', 'Reese N.', 'Skyler F.', 'Rowan G.',
];

const REVIEW_TEMPLATES = {
  high: [
    { title: 'Exceeded expectations', body: 'Great value for the price, works exactly as described. Would buy again.' },
    { title: 'Very happy with this', body: 'Solid build quality and arrived well packaged. No complaints so far.' },
    { title: 'Exactly what I needed', body: 'Does what it says on the box. Setup was quick and painless.' },
    { title: 'Highly recommend', body: 'Been using this daily for weeks now and it still performs like new.' },
  ],
  mid: [
    { title: 'Good, with a few caveats', body: 'Good quality but delivery took longer than expected. Product itself is fine.' },
    { title: 'Does the job', body: 'Not flashy, but reliable. A couple of minor rough edges in the finish.' },
    { title: 'Decent for the price', body: 'Works as expected, though the instructions could be clearer.' },
  ],
  low: [
    { title: 'Mixed feelings', body: 'Not quite what I expected, but customer service was helpful when I reached out.' },
    { title: 'Just okay', body: 'It works, but I was hoping for a bit more polish given the price point.' },
    { title: 'Had some issues', body: 'Ran into a minor defect out of the box; still usable but disappointing.' },
  ],
};

function tierFor(starRating) {
  if (starRating >= 4) return 'high';
  if (starRating === 3) return 'mid';
  return 'low';
}

export function getMockReviews(productId, rating) {
  const reviews = [];
  for (let i = 0; i < 5; i += 1) {
    const seed = channelHash(productId, `review-${i}`);
    const spread = (seed % 5) - 2; // -2..2
    const starRating = Math.min(5, Math.max(1, Math.round(rating + spread * 0.5)));
    const tier = tierFor(starRating);
    const template = pick(REVIEW_TEMPLATES[tier], seed);
    const daysAgo = seed % 120;
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    reviews.push({
      id: `${productId}-review-${i}`,
      author: pick(REVIEW_AUTHORS, seed),
      rating: starRating,
      title: template.title,
      body: template.body,
      date,
      verified: seed % 4 !== 0,
      helpfulCount: seed % 141,
    });
  }
  return reviews;
}
