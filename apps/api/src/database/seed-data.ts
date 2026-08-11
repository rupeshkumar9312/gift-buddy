// Ported from apps/web/src/lib/data.ts — the storefront's original mock catalog,
// now the source of truth for what gets seeded into the real database.

const img = (seed: string, w = 600, h = 750) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const seedCategories = [
  {
    slug: 'garment-care',
    name: 'Garment Care',
    image: img('cat-garment', 500, 620),
  },
  {
    slug: 'home-living',
    name: 'Home & Living',
    image: img('cat-home', 500, 620),
  },
  {
    slug: 'jewelry-accessories',
    name: 'Jewelry & Accessories',
    image: img('cat-jewelry', 500, 620),
  },
  {
    slug: 'occasion-gifts',
    name: 'Occasion Gifts',
    image: img('cat-occasion', 500, 620),
  },
  {
    slug: 'office-stationery',
    name: 'Office & Stationery',
    image: img('cat-office', 500, 620),
  },
  {
    slug: 'personalised-gifts',
    name: 'Personalised Gifts',
    image: img('cat-personalised', 500, 620),
  },
];

type SeedProduct = {
  slug: string;
  name: string;
  price: number;
  salePrice?: number;
  rating: number;
  reviews: number;
  category: string;
  isFeatured?: boolean;
  isNew?: boolean;
  description: string;
  sku: string;
  inStock: boolean;
  gallery: string[];
};

export const seedProducts: SeedProduct[] = [
  {
    slug: 'hallmark-stuffed-snoopy',
    name: 'Hallmark Stuffed Snoopy',
    price: 132,
    rating: 3.5,
    reviews: 8,
    category: 'personalised-gifts',
    description:
      'A soft, huggable Snoopy plush that makes a delightful gift for kids and collectors alike. Finished with premium stitching and a friendly embroidered smile.',
    sku: 'GFY-1001',
    inStock: true,
    gallery: [
      img('p-snoopy-1'),
      img('p-snoopy-2'),
      img('p-snoopy-3'),
      img('p-snoopy-4'),
    ],
  },
  {
    slug: 'throated-hummingbird-statue-figurine',
    name: 'Throated Hummingbird Statue Figurine',
    price: 141,
    salePrice: 112,
    rating: 4.5,
    reviews: 14,
    category: 'home-living',
    description:
      'A hand-painted hummingbird figurine cast in fine resin, capturing mid-flight elegance. A charming accent piece for shelves, mantels, or garden windows.',
    sku: 'GFY-1002',
    inStock: true,
    gallery: [
      img('p-hummingbird-1'),
      img('p-hummingbird-2'),
      img('p-hummingbird-3'),
      img('p-hummingbird-4'),
    ],
  },
  {
    slug: 'the-golden-girls-perpetual-calendar',
    name: 'The Golden Girls Perpetual Calendar',
    price: 117,
    salePrice: 92,
    rating: 5,
    reviews: 21,
    category: 'office-stationery',
    description:
      'A witty, reusable perpetual desk calendar featuring iconic quotes. Comes in a sturdy easel-back frame perfect for any desk or bookshelf.',
    sku: 'GFY-1003',
    inStock: true,
    gallery: [
      img('p-calendar-1'),
      img('p-calendar-2'),
      img('p-calendar-3'),
      img('p-calendar-4'),
    ],
  },
  {
    slug: 'the-bum-box',
    name: 'The Bum Box',
    price: 187,
    salePrice: 148,
    rating: 4,
    reviews: 6,
    category: 'occasion-gifts',
    description:
      'A curated novelty gift box packed with a playful assortment of treats and trinkets. Guaranteed to bring a laugh at any celebration.',
    sku: 'GFY-1004',
    inStock: true,
    gallery: [
      img('p-bumbox-1'),
      img('p-bumbox-2'),
      img('p-bumbox-3'),
      img('p-bumbox-4'),
    ],
  },
  {
    slug: 'soleil-stretchy-ball-bead-mask-necklace',
    name: 'Soleil Stretchy Ball Bead Mask Necklace',
    price: 105,
    salePrice: 63,
    rating: 5,
    reviews: 11,
    category: 'jewelry-accessories',
    description:
      'A hand-strung beaded necklace with a stretch-fit design, finished in warm sunlit tones. Lightweight, adjustable, and easy to layer.',
    sku: 'GFY-1005',
    inStock: true,
    gallery: [
      img('p-necklace-1'),
      img('p-necklace-2'),
      img('p-necklace-3'),
      img('p-necklace-4'),
    ],
  },
  {
    slug: 'snoopy-with-hearts-garland',
    name: 'Snoopy with Hearts Garland',
    price: 100,
    salePrice: 70,
    rating: 4.5,
    reviews: 9,
    category: 'home-living',
    description:
      'A cheerful felt garland strung with hearts, perfect for dressing up a nursery, mantel, or party backdrop.',
    sku: 'GFY-1006',
    inStock: true,
    gallery: [
      img('p-garland-1'),
      img('p-garland-2'),
      img('p-garland-3'),
      img('p-garland-4'),
    ],
  },
  {
    slug: 'rectangular-aluminium-tray',
    name: 'Rectangular Aluminium Tray',
    price: 162,
    salePrice: 112,
    rating: 5,
    reviews: 17,
    category: 'home-living',
    description:
      'A brushed aluminium serving tray with reinforced handles, ideal for entertaining or as an elegant catch-all on a console table.',
    sku: 'GFY-1007',
    inStock: true,
    gallery: [
      img('p-tray-1'),
      img('p-tray-2'),
      img('p-tray-3'),
      img('p-tray-4'),
    ],
  },
  {
    slug: 'nici-toucan-bag-pendant-faux',
    name: 'NICI Toucan Bag Pendant Faux',
    price: 145,
    salePrice: 87,
    rating: 4,
    reviews: 5,
    category: 'personalised-gifts',
    description:
      'A plush toucan bag charm with faux-fur trim, clipped on a sturdy keyring — a playful finishing touch for any tote or backpack.',
    sku: 'GFY-1008',
    inStock: true,
    gallery: [
      img('p-toucan-1'),
      img('p-toucan-2'),
      img('p-toucan-3'),
      img('p-toucan-4'),
    ],
  },
  {
    slug: 'engraved-oak-jewelry-box',
    name: 'Engraved Oak Jewelry Box',
    price: 96,
    rating: 4.5,
    reviews: 12,
    category: 'personalised-gifts',
    isNew: true,
    description:
      'A solid oak jewelry box with a custom-engraved lid and a velvet-lined interior, sized perfectly for rings, earrings, and keepsakes.',
    sku: 'GFY-1009',
    inStock: true,
    gallery: [
      img('p-jewelrybox-1'),
      img('p-jewelrybox-2'),
      img('p-jewelrybox-3'),
      img('p-jewelrybox-4'),
    ],
  },
  {
    slug: 'hand-poured-soy-candle-set',
    name: 'Hand-Poured Soy Candle Set',
    price: 58,
    rating: 5,
    reviews: 24,
    category: 'home-living',
    isFeatured: true,
    description:
      'A trio of hand-poured soy candles in warm, cozy scents, presented in a ribboned gift box ready for giving.',
    sku: 'GFY-1010',
    inStock: true,
    gallery: [
      img('p-candle-1'),
      img('p-candle-2'),
      img('p-candle-3'),
      img('p-candle-4'),
    ],
  },
  {
    slug: 'leather-bound-travel-journal',
    name: 'Leather-Bound Travel Journal',
    price: 42,
    rating: 4,
    reviews: 7,
    category: 'office-stationery',
    description:
      'A refillable leather travel journal with a pocket for tickets and mementos — a thoughtful gift for the wanderer in your life.',
    sku: 'GFY-1011',
    inStock: true,
    gallery: [
      img('p-journal-1'),
      img('p-journal-2'),
      img('p-journal-3'),
      img('p-journal-4'),
    ],
  },
  {
    slug: 'botanical-print-tote-bag',
    name: 'Botanical Print Tote Bag',
    price: 34,
    rating: 4.5,
    reviews: 10,
    category: 'garment-care',
    isNew: true,
    description:
      'A heavyweight canvas tote printed with a hand-illustrated botanical pattern, reinforced stitching at every seam.',
    sku: 'GFY-1012',
    inStock: false,
    gallery: [
      img('p-tote-1'),
      img('p-tote-2'),
      img('p-tote-3'),
      img('p-tote-4'),
    ],
  },
];
