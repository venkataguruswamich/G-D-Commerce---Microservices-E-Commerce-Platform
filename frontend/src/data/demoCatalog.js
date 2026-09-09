// Curated fallback catalog: shaped exactly like the real Product/Category
// types returned by product-service, plus a `_demoImages` gallery array
// (the real backend only ever has a single `imageUrl` per product). Used by
// utils/catalog.js as a fallback when the real API is unreachable or sparse,
// so the storefront always has enough inventory to demonstrate every layout
// (hero carousels, PLP facets, PDP galleries) without requiring the full
// docker-compose stack to be running with a fully-seeded database.

const UNSPLASH = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=85`;

function daysAgoIso(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export const demoCategories = [
  { id: 'demo-cat-electronics', name: 'Electronics', slug: 'electronics', description: 'Phones, laptops, and gadgets' },
  { id: 'demo-cat-home-kitchen', name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Everything for your home' },
];

const ELECTRONICS = [
  {
    id: 'demo-elec-01',
    sku: 'DEMO-ELEC-01',
    name: 'AudioMax Pro Wireless Noise-Cancelling Headphones',
    description:
      'Over-ear headphones with active noise cancellation, 30-hour battery life, and plush memory-foam ear cushions for all-day comfort.',
    priceCents: 12999,
    images: ['1505740420928-5e560c06d30e', '1484704849700-f032a568e944', '1524678606370-a47ad25cb82a'],
    ageDays: 4,
  },
  {
    id: 'demo-elec-02',
    sku: 'DEMO-ELEC-02',
    name: 'Zenlite Buds True Wireless Earbuds',
    description:
      'Compact true-wireless earbuds with a 6mm driver, IPX5 sweat resistance, and a pocket-sized charging case for up to 24 hours of playback.',
    priceCents: 7999,
    images: ['1590658268037-6bf12165a8df', '1572569511254-d8f925fe2cbb', '1600294037681-c80b4cb5b434'],
    ageDays: 11,
  },
  {
    id: 'demo-elec-03',
    sku: 'DEMO-ELEC-03',
    name: 'Voltrix Nova 5G Smartphone',
    description:
      '6.5" AMOLED display, triple-lens 108MP camera system, and all-day battery with 45W fast charging on the latest 5G network bands.',
    priceCents: 79900,
    images: ['1511707171634-5f897ff02aa9', '1523206489230-c012c64b2b48', '1512054502232-10a0a035d672'],
    ageDays: 2,
  },
  {
    id: 'demo-elec-04',
    sku: 'DEMO-ELEC-04',
    name: 'NimbusTech Air 14 Ultra-Slim Laptop',
    description:
      '14" 2.8K display, 16GB RAM, 512GB SSD, and a fanless design that weighs just 2.4 lbs — built for all-day productivity on the go.',
    priceCents: 119900,
    images: ['1496181133206-80ce9b88a853', '1517336714731-489689fd1ca8', '1541807084-5c52b6b3adef'],
    ageDays: 27,
  },
  {
    id: 'demo-elec-05',
    sku: 'DEMO-ELEC-05',
    name: 'Orbitalis Pulse Fitness Smartwatch',
    description:
      'Continuous heart-rate and SpO2 tracking, built-in GPS, 14-day battery life, and a always-on AMOLED display in a lightweight aluminum case.',
    priceCents: 24999,
    images: ['1523275335684-37898b6baf30', '1544117519-31a4b719223d', '1508685096489-7aacd43bd3b1'],
    ageDays: 8,
  },
  {
    id: 'demo-elec-06',
    sku: 'DEMO-ELEC-06',
    name: 'Kryon Vision 55-Inch 4K Smart TV',
    description:
      '55" 4K HDR display with built-in streaming apps, voice remote, and a slim bezel design that fits seamlessly into any living room.',
    priceCents: 59900,
    images: ['1593359677879-a4bb92f829d1', '1567690187548-f07b1d7bf5a9', '1601944179066-29786cb9d32a'],
    ageDays: 34,
  },
  {
    id: 'demo-elec-07',
    sku: 'DEMO-ELEC-07',
    name: 'Wavelength ProShot Mirrorless Camera',
    description:
      '24.2MP APS-C sensor, 4K video recording, in-body image stabilization, and a fast hybrid autofocus system for stills and video alike.',
    priceCents: 89900,
    images: ['1502920917128-1aa500764cbd', '1516035069371-29a1b244cc32', '1519183071298-a2962be90b8e'],
    ageDays: 46,
  },
  {
    id: 'demo-elec-08',
    sku: 'DEMO-ELEC-08',
    name: 'Zenlite Boom Portable Bluetooth Speaker',
    description:
      '360° sound with deep bass, IP67 waterproof and dustproof rating, and 20 hours of battery life — durable enough for outdoor adventures.',
    priceCents: 8999,
    images: ['1545454675-3531b543be5d', '1550009158-9ebf69173e03', '1520170350707-b2da59970118'],
    ageDays: 15,
  },
  {
    id: 'demo-elec-09',
    sku: 'DEMO-ELEC-09',
    name: 'Voltrix Slate 10-Inch Tablet',
    description:
      '10.1" full-HD display, octa-core processor, and 8000mAh battery — ideal for streaming, note-taking, and light productivity work.',
    priceCents: 34900,
    images: ['1544244015-0df4b3ffc6b0', '1561154464-82e9adf32764', '1587033411391-5d9e51cce126'],
    ageDays: 52,
  },
];

const HOME_KITCHEN = [
  {
    id: 'demo-home-01',
    sku: 'DEMO-HOME-01',
    name: 'Hearthwood PowerBlend High-Speed Blender',
    description:
      '1200W motor with 6 stainless-steel blades, variable speed control, and a 64oz BPA-free pitcher — crushes ice and blends smoothies in seconds.',
    priceCents: 6499,
    images: ['1570222094114-d054a817e56b', '1610614819513-58e34989848b', '1622480916113-9000ac49b79d'],
    ageDays: 6,
  },
  {
    id: 'demo-home-02',
    sku: 'DEMO-HOME-02',
    name: 'CasaVerde 10-Piece Nonstick Cookware Set',
    description:
      'Durable nonstick coating, tempered-glass lids, and heat-resistant handles — everything needed to stock a modern kitchen in one set.',
    priceCents: 15999,
    images: ['1585515320310-259814833e62', '1590794056226-79ef3a8147e1', '1584990347449-a5d9f800a783'],
    ageDays: 19,
  },
  {
    id: 'demo-home-03',
    sku: 'DEMO-HOME-03',
    name: 'Lumora Arc Modern Table Lamp',
    description:
      'Adjustable arc-arm table lamp with a dimmable warm-white LED bulb and a weighted marble-effect base for a soft ambient glow.',
    priceCents: 4499,
    images: ['1507473885765-e6ed057f782c', '1513506003901-1e6a229e2d15', '1524634126442-357e0eda3fe5'],
    ageDays: 3,
  },
  {
    id: 'demo-home-04',
    sku: 'DEMO-HOME-04',
    name: 'Nestwell Cyclone Cordless Stick Vacuum',
    description:
      'Lightweight cordless vacuum with 45 minutes of runtime, a detachable handheld unit, and a HEPA filter for allergen-free cleaning.',
    priceCents: 19999,
    images: ['1558618666-fcd25c85cd64', '1585421514738-01798e348b17', '1607613009820-a29f7bb81c04'],
    ageDays: 22,
  },
  {
    id: 'demo-home-05',
    sku: 'DEMO-HOME-05',
    name: 'CasaVerde Cloud Cooling Bedding Set (Queen)',
    description:
      'Breathable microfiber sheet set with a cooling finish, deep pockets for thick mattresses, and a fade-resistant weave that softens with every wash.',
    priceCents: 7999,
    images: ['1522771739844-6a9f6d5f14af', '1584100936595-c0654b55a2e6', '1522708323590-d24dbb6b0267'],
    ageDays: 41,
  },
  {
    id: 'demo-home-06',
    sku: 'DEMO-HOME-06',
    name: 'Hearthwood Crisp Digital Air Fryer',
    description:
      '5.8-quart digital air fryer with 8 preset cooking modes, a dishwasher-safe nonstick basket, and rapid hot-air circulation for oil-free frying.',
    priceCents: 9999,
    images: ['1626074353765-517a681e40be', '1574179629137-88b23bc6f0e9', '1608039755401-742074f0548d'],
    ageDays: 9,
  },
  {
    id: 'demo-home-07',
    sku: 'DEMO-HOME-07',
    name: 'KitchenCraft Co. Brew Master Programmable Coffee Maker',
    description:
      '12-cup programmable coffee maker with a built-in grinder, adjustable brew strength, and a thermal carafe that keeps coffee hot for hours.',
    priceCents: 8499,
    images: ['1509785307050-d4066910ec1e', '1517701550927-30cf4ba1dba9', '1442512595331-e89e73853f31'],
    ageDays: 30,
  },
  {
    id: 'demo-home-08',
    sku: 'DEMO-HOME-08',
    name: 'Copperline Precision 12-Piece Cutlery Set',
    description:
      'Full-tang, high-carbon stainless-steel knife set with an acacia wood block and built-in sharpener — precision-balanced for everyday prep.',
    priceCents: 6999,
    images: ['1594736797933-d0501ba2fe65', '1608219992759-8d74ed8d76eb', '1593618998160-e34014e67546'],
    ageDays: 14,
  },
  {
    id: 'demo-home-09',
    sku: 'DEMO-HOME-09',
    name: 'Nestwell Tidy Stackable Storage Bins (Set of 6)',
    description:
      'Collapsible fabric storage bins with reinforced handles and label windows — stack neatly in closets, pantries, or under-bed storage.',
    priceCents: 3499,
    images: ['1600166898405-da9535204843', '1595428774223-ef52624120d2', '1584589167171-541ce45f1eea'],
    ageDays: 58,
  },
];

function buildProducts(list, categoryId, categoryName) {
  return list.map((item) => {
    const demoImages = item.images.map(UNSPLASH);
    const createdAt = daysAgoIso(item.ageDays);
    return {
      id: item.id,
      categoryId,
      categoryName,
      sku: item.sku,
      name: item.name,
      description: item.description,
      priceCents: item.priceCents,
      currency: 'USD',
      imageUrl: demoImages[0],
      isActive: true,
      createdAt,
      updatedAt: createdAt,
      _demoImages: demoImages,
    };
  });
}

export const demoProducts = [
  ...buildProducts(ELECTRONICS, 'demo-cat-electronics', 'Electronics'),
  ...buildProducts(HOME_KITCHEN, 'demo-cat-home-kitchen', 'Home & Kitchen'),
];
