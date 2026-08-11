import type { BlogPost, Category, Product, Testimonial } from "./types";

const img = (seed: string, w = 600, h = 750) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const categories: Category[] = [
  { slug: "garment-care", name: "Garment Care", image: img("cat-garment", 500, 620), count: 12 },
  { slug: "home-living", name: "Home & Living", image: img("cat-home", 500, 620), count: 28 },
  { slug: "jewelry-accessories", name: "Jewelry & Accessories", image: img("cat-jewelry", 500, 620), count: 19 },
  { slug: "occasion-gifts", name: "Occasion Gifts", image: img("cat-occasion", 500, 620), count: 24 },
  { slug: "office-stationery", name: "Office & Stationery", image: img("cat-office", 500, 620), count: 15 },
  { slug: "personalised-gifts", name: "Personalised Gifts", image: img("cat-personalised", 500, 620), count: 21 },
];

export const products: Product[] = [
  {
    slug: "hallmark-stuffed-snoopy",
    name: "Hallmark Stuffed Snoopy",
    price: 132,
    image: img("p-snoopy-1"),
    image2: img("p-snoopy-2"),
    rating: 3.5,
    reviews: 8,
    category: "personalised-gifts",
    description:
      "A soft, huggable Snoopy plush that makes a delightful gift for kids and collectors alike. Finished with premium stitching and a friendly embroidered smile.",
    sku: "GFY-1001",
    inStock: true,
    gallery: [img("p-snoopy-1"), img("p-snoopy-2"), img("p-snoopy-3"), img("p-snoopy-4")],
  },
  {
    slug: "throated-hummingbird-statue-figurine",
    name: "Throated Hummingbird Statue Figurine",
    price: 141,
    salePrice: 112,
    image: img("p-hummingbird-1"),
    image2: img("p-hummingbird-2"),
    rating: 4.5,
    reviews: 14,
    category: "home-living",
    badge: "sale",
    description:
      "A hand-painted hummingbird figurine cast in fine resin, capturing mid-flight elegance. A charming accent piece for shelves, mantels, or garden windows.",
    sku: "GFY-1002",
    inStock: true,
    gallery: [img("p-hummingbird-1"), img("p-hummingbird-2"), img("p-hummingbird-3"), img("p-hummingbird-4")],
  },
  {
    slug: "the-golden-girls-perpetual-calendar",
    name: "The Golden Girls Perpetual Calendar",
    price: 117,
    salePrice: 92,
    image: img("p-calendar-1"),
    image2: img("p-calendar-2"),
    rating: 5,
    reviews: 21,
    category: "office-stationery",
    badge: "sale",
    description:
      "A witty, reusable perpetual desk calendar featuring iconic quotes. Comes in a sturdy easel-back frame perfect for any desk or bookshelf.",
    sku: "GFY-1003",
    inStock: true,
    gallery: [img("p-calendar-1"), img("p-calendar-2"), img("p-calendar-3"), img("p-calendar-4")],
  },
  {
    slug: "the-bum-box",
    name: "The Bum Box",
    price: 187,
    salePrice: 148,
    image: img("p-bumbox-1"),
    image2: img("p-bumbox-2"),
    rating: 4,
    reviews: 6,
    category: "occasion-gifts",
    badge: "sale",
    description:
      "A curated novelty gift box packed with a playful assortment of treats and trinkets. Guaranteed to bring a laugh at any celebration.",
    sku: "GFY-1004",
    inStock: true,
    gallery: [img("p-bumbox-1"), img("p-bumbox-2"), img("p-bumbox-3"), img("p-bumbox-4")],
  },
  {
    slug: "soleil-stretchy-ball-bead-mask-necklace",
    name: "Soleil Stretchy Ball Bead Mask Necklace",
    price: 105,
    salePrice: 63,
    image: img("p-necklace-1"),
    image2: img("p-necklace-2"),
    rating: 5,
    reviews: 11,
    category: "jewelry-accessories",
    badge: "sale",
    description:
      "A hand-strung beaded necklace with a stretch-fit design, finished in warm sunlit tones. Lightweight, adjustable, and easy to layer.",
    sku: "GFY-1005",
    inStock: true,
    gallery: [img("p-necklace-1"), img("p-necklace-2"), img("p-necklace-3"), img("p-necklace-4")],
  },
  {
    slug: "snoopy-with-hearts-garland",
    name: "Snoopy with Hearts Garland",
    price: 100,
    salePrice: 70,
    image: img("p-garland-1"),
    image2: img("p-garland-2"),
    rating: 4.5,
    reviews: 9,
    category: "home-living",
    badge: "sale",
    description:
      "A cheerful felt garland strung with hearts, perfect for dressing up a nursery, mantel, or party backdrop.",
    sku: "GFY-1006",
    inStock: true,
    gallery: [img("p-garland-1"), img("p-garland-2"), img("p-garland-3"), img("p-garland-4")],
  },
  {
    slug: "rectangular-aluminium-tray",
    name: "Rectangular Aluminium Tray",
    price: 162,
    salePrice: 112,
    image: img("p-tray-1"),
    image2: img("p-tray-2"),
    rating: 5,
    reviews: 17,
    category: "home-living",
    badge: "sale",
    description:
      "A brushed aluminium serving tray with reinforced handles, ideal for entertaining or as an elegant catch-all on a console table.",
    sku: "GFY-1007",
    inStock: true,
    gallery: [img("p-tray-1"), img("p-tray-2"), img("p-tray-3"), img("p-tray-4")],
  },
  {
    slug: "nici-toucan-bag-pendant-faux",
    name: "NICI Toucan Bag Pendant Faux",
    price: 145,
    salePrice: 87,
    image: img("p-toucan-1"),
    image2: img("p-toucan-2"),
    rating: 4,
    reviews: 5,
    category: "personalised-gifts",
    badge: "sale",
    description:
      "A plush toucan bag charm with faux-fur trim, clipped on a sturdy keyring — a playful finishing touch for any tote or backpack.",
    sku: "GFY-1008",
    inStock: true,
    gallery: [img("p-toucan-1"), img("p-toucan-2"), img("p-toucan-3"), img("p-toucan-4")],
  },
  {
    slug: "engraved-oak-jewelry-box",
    name: "Engraved Oak Jewelry Box",
    price: 96,
    image: img("p-jewelrybox-1"),
    image2: img("p-jewelrybox-2"),
    rating: 4.5,
    reviews: 12,
    category: "personalised-gifts",
    badge: "new",
    description:
      "A solid oak jewelry box with a custom-engraved lid and a velvet-lined interior, sized perfectly for rings, earrings, and keepsakes.",
    sku: "GFY-1009",
    inStock: true,
    gallery: [img("p-jewelrybox-1"), img("p-jewelrybox-2"), img("p-jewelrybox-3"), img("p-jewelrybox-4")],
  },
  {
    slug: "hand-poured-soy-candle-set",
    name: "Hand-Poured Soy Candle Set",
    price: 58,
    image: img("p-candle-1"),
    image2: img("p-candle-2"),
    rating: 5,
    reviews: 24,
    category: "home-living",
    badge: "hot",
    description:
      "A trio of hand-poured soy candles in warm, cozy scents, presented in a ribboned gift box ready for giving.",
    sku: "GFY-1010",
    inStock: true,
    gallery: [img("p-candle-1"), img("p-candle-2"), img("p-candle-3"), img("p-candle-4")],
  },
  {
    slug: "leather-bound-travel-journal",
    name: "Leather-Bound Travel Journal",
    price: 42,
    image: img("p-journal-1"),
    image2: img("p-journal-2"),
    rating: 4,
    reviews: 7,
    category: "office-stationery",
    description:
      "A refillable leather travel journal with a pocket for tickets and mementos — a thoughtful gift for the wanderer in your life.",
    sku: "GFY-1011",
    inStock: true,
    gallery: [img("p-journal-1"), img("p-journal-2"), img("p-journal-3"), img("p-journal-4")],
  },
  {
    slug: "botanical-print-tote-bag",
    name: "Botanical Print Tote Bag",
    price: 34,
    image: img("p-tote-1"),
    image2: img("p-tote-2"),
    rating: 4.5,
    reviews: 10,
    category: "garment-care",
    badge: "new",
    description:
      "A heavyweight canvas tote printed with a hand-illustrated botanical pattern, reinforced stitching at every seam.",
    sku: "GFY-1012",
    inStock: false,
    gallery: [img("p-tote-1"), img("p-tote-2"), img("p-tote-3"), img("p-tote-4")],
  },
];

export const featuredProducts = products.slice(0, 8);

export const blogPosts: BlogPost[] = [
  {
    slug: "promotional-advertising-specialty-you-ve-waited-long-enough",
    title: "Promotional Advertising Specialty You've Waited Long Enough",
    excerpt:
      "A look at how thoughtfully branded gifts outperform traditional advertising when it comes to lasting impressions.",
    content:
      "A look at how thoughtfully branded gifts outperform traditional advertising when it comes to lasting impressions. From desk accessories to apparel, the right promotional item keeps a brand top of mind long after the campaign ends. In this piece we break down what makes a promotional gift memorable, how to choose materials that reflect quality, and why unboxing experiences matter more than ever.",
    image: img("blog-1", 900, 600),
    author: "admin",
    date: "May 7, 2026",
    comments: 4,
  },
  {
    slug: "what-is-the-big-r-for-marketing-your-business",
    title: "What Is The Big R For Marketing Your Business",
    excerpt:
      "Relationships, not reach, are the real currency of modern marketing — here's how gifting plays a role.",
    content:
      "Relationships, not reach, are the real currency of modern marketing. Gifting has quietly become one of the most effective tools for building loyalty with customers and partners alike. This article explores the psychology behind reciprocity, and how a well-timed gift can do more for retention than another round of ads.",
    image: img("blog-2", 900, 600),
    author: "admin",
    date: "June 9, 2026",
    comments: 2,
  },
  {
    slug: "5-thoughtful-gift-ideas-for-any-occasion",
    title: "5 Thoughtful Gift Ideas for Any Occasion",
    excerpt:
      "Stuck on what to give? Here are five categories of gifts that fit almost every celebration.",
    content:
      "Stuck on what to give? Here are five categories of gifts that fit almost every celebration — from personalised keepsakes to curated gift baskets. We walk through how to match a gift to the occasion, the recipient, and your budget without losing the personal touch.",
    image: img("blog-3", 900, 600),
    author: "admin",
    date: "July 2, 2026",
    comments: 6,
  },
  {
    slug: "how-to-wrap-the-perfect-gift-box",
    title: "How to Wrap the Perfect Gift Box",
    excerpt:
      "A step-by-step guide to wrapping gifts that look as good as what's inside.",
    content:
      "A step-by-step guide to wrapping gifts that look as good as what's inside. Presentation matters — we cover paper choices, ribbon techniques, and a few tricks for awkwardly shaped items so every gift looks store-bought perfect.",
    image: img("blog-4", 900, 600),
    author: "admin",
    date: "July 21, 2026",
    comments: 1,
  },
];

export const testimonials: Testimonial[] = [
  {
    quote: "Love my basket! It's going to make a wonderful gift!",
    author: "Hannah Vaughn",
    role: "Verified Buyer",
    avatar: img("avatar-1", 160, 160),
  },
  {
    quote: "Fast shipping and the packaging alone felt like a present.",
    author: "Marcus Lee",
    role: "Verified Buyer",
    avatar: img("avatar-2", 160, 160),
  },
  {
    quote: "Found the perfect personalised gift in minutes. Will be back!",
    author: "Priya Nair",
    role: "Verified Buyer",
    avatar: img("avatar-3", 160, 160),
  },
];

export const giftKits = [
  { slug: "for-him", title: "For Him", count: 6, image: img("kit-him", 500, 400) },
  { slug: "for-baby", title: "For Baby", count: 7, image: img("kit-baby", 500, 400) },
  { slug: "occasions", title: "Occasions", count: 3, image: img("kit-occasions", 500, 400) },
  { slug: "for-her", title: "For Her", count: 8, image: img("kit-her", 500, 400) },
];

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, count = 4) {
  return products
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .concat(products.filter((p) => p.slug !== product.slug && p.category !== product.category))
    .slice(0, count);
}

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}
