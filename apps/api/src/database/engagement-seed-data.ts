import { CouponType } from '../coupons/entities/coupon.entity';
import { BlogPostStatus } from '../content/entities/blog-post.entity';
import { FaqGroup } from '../content/entities/faq.entity';

const img = (seed: string, w = 900, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

// Dev-only seed customers — used to own the seeded product reviews so the
// home page has real testimonials on a fresh database. Not admin accounts.
export const seedCustomers = [
  {
    email: 'hannah@giftbuddy.test',
    password: 'customer12345',
    firstName: 'Hannah',
    lastName: 'Vaughn',
  },
  {
    email: 'marcus@giftbuddy.test',
    password: 'customer12345',
    firstName: 'Marcus',
    lastName: 'Lee',
  },
  {
    email: 'priya@giftbuddy.test',
    password: 'customer12345',
    firstName: 'Priya',
    lastName: 'Nair',
  },
];

export const seedReviews = [
  {
    productSlug: 'engraved-oak-jewelry-box',
    customerEmail: 'hannah@giftbuddy.test',
    rating: 5,
    title: 'Made a wonderful gift',
    body: "Love my basket! It's going to make a wonderful gift!",
    isApproved: true,
    isFeatured: true,
  },
  {
    productSlug: 'leather-bound-travel-journal',
    customerEmail: 'marcus@giftbuddy.test',
    rating: 5,
    title: 'Packaging felt like a present itself',
    body: 'Fast shipping and the packaging alone felt like a present.',
    isApproved: true,
    isFeatured: true,
  },
  {
    productSlug: 'hand-poured-soy-candle-set',
    customerEmail: 'priya@giftbuddy.test',
    rating: 5,
    title: 'Found the perfect personalised gift',
    body: 'Found the perfect personalised gift in minutes. Will be back!',
    isApproved: true,
    isFeatured: true,
  },
  {
    productSlug: 'botanical-print-tote-bag',
    customerEmail: 'hannah@giftbuddy.test',
    rating: 4,
    title: 'Nice everyday tote',
    body: 'Great quality print and sturdy straps — my go-to market bag now.',
    isApproved: true,
    isFeatured: false,
  },
  {
    productSlug: 'rectangular-aluminium-tray',
    customerEmail: 'marcus@giftbuddy.test',
    rating: 3,
    title: 'Good but smaller than expected',
    body: "Nice tray, just check the dimensions — it's a bit smaller than I pictured.",
    isApproved: false,
    isFeatured: false,
  },
];

export const seedCoupons = [
  {
    code: 'WELCOME10',
    type: CouponType.PERCENT,
    value: '10.00',
    minSubtotal: '0.00',
    usageLimit: null,
  },
  {
    code: 'FREESHIP',
    type: CouponType.FIXED,
    value: '8.00',
    minSubtotal: '50.00',
    usageLimit: null,
  },
];

export const seedFaqs = [
  {
    group: FaqGroup.SHIPPING,
    question: 'How long does shipping take?',
    answer:
      'Standard shipping takes 3-5 business days. Orders over $99 ship free; expedited options are available at checkout.',
    sortOrder: 0,
  },
  {
    group: FaqGroup.SHIPPING,
    question: 'Do you ship internationally?',
    answer:
      'Yes, we ship to most countries. International delivery times vary between 7-14 business days depending on destination.',
    sortOrder: 1,
  },
  {
    group: FaqGroup.SHIPPING,
    question: 'Can I track my order?',
    answer:
      "Absolutely — once your order ships you'll receive a tracking link by email, or you can check status on our Track Orders page.",
    sortOrder: 2,
  },
  {
    group: FaqGroup.RETURNS,
    question: 'What is your return policy?',
    answer:
      'We accept returns within 30 days of delivery for unused items in original packaging. Personalised gifts are final sale.',
    sortOrder: 0,
  },
  {
    group: FaqGroup.RETURNS,
    question: 'How do I start a return?',
    answer:
      "Reach out from the Contact page with your order number and we'll email you a prepaid return label.",
    sortOrder: 1,
  },
  {
    group: FaqGroup.ORDERS,
    question: 'Can I change or cancel my order?',
    answer:
      "Orders can be changed or cancelled within 1 hour of placing them. After that, we've usually started packing.",
    sortOrder: 0,
  },
  {
    group: FaqGroup.ORDERS,
    question: 'Do you offer gift wrapping?',
    answer:
      "Yes! Add gift wrapping at checkout for a small fee and we'll include a handwritten note card.",
    sortOrder: 1,
  },
];

export const seedBlogPosts = [
  {
    slug: 'promotional-advertising-specialty-you-ve-waited-long-enough',
    title: "Promotional Advertising Specialty You've Waited Long Enough",
    excerpt:
      'A look at how thoughtfully branded gifts outperform traditional advertising when it comes to lasting impressions.',
    content:
      'A look at how thoughtfully branded gifts outperform traditional advertising when it comes to lasting impressions. From desk accessories to apparel, the right promotional item keeps a brand top of mind long after the campaign ends. In this piece we break down what makes a promotional gift memorable, how to choose materials that reflect quality, and why unboxing experiences matter more than ever.',
    coverImage: img('blog-1'),
    status: BlogPostStatus.PUBLISHED,
    publishedAt: new Date('2026-05-07'),
  },
  {
    slug: 'what-is-the-big-r-for-marketing-your-business',
    title: 'What Is The Big R For Marketing Your Business',
    excerpt:
      "Relationships, not reach, are the real currency of modern marketing — here's how gifting plays a role.",
    content:
      'Relationships, not reach, are the real currency of modern marketing. Gifting has quietly become one of the most effective tools for building loyalty with customers and partners alike. This article explores the psychology behind reciprocity, and how a well-timed gift can do more for retention than another round of ads.',
    coverImage: img('blog-2'),
    status: BlogPostStatus.PUBLISHED,
    publishedAt: new Date('2026-06-09'),
  },
  {
    slug: '5-thoughtful-gift-ideas-for-any-occasion',
    title: '5 Thoughtful Gift Ideas for Any Occasion',
    excerpt:
      'Stuck on what to give? Here are five categories of gifts that fit almost every celebration.',
    content:
      'Stuck on what to give? Here are five categories of gifts that fit almost every celebration — from personalised keepsakes to curated gift baskets. We walk through how to match a gift to the occasion, the recipient, and your budget without losing the personal touch.',
    coverImage: img('blog-3'),
    status: BlogPostStatus.PUBLISHED,
    publishedAt: new Date('2026-07-02'),
  },
  {
    slug: 'how-to-wrap-the-perfect-gift-box',
    title: 'How to Wrap the Perfect Gift Box',
    excerpt:
      "A step-by-step guide to wrapping gifts that look as good as what's inside.",
    content:
      "A step-by-step guide to wrapping gifts that look as good as what's inside. Presentation matters — we cover paper choices, ribbon techniques, and a few tricks for awkwardly shaped items so every gift looks store-bought perfect.",
    coverImage: img('blog-4'),
    status: BlogPostStatus.PUBLISHED,
    publishedAt: new Date('2026-07-21'),
  },
  {
    slug: 'gift-wrapping-trends-were-watching',
    title: "Gift Wrapping Trends We're Watching",
    excerpt:
      'A quick look at furoshiki cloth, kraft paper, and other trends set to define next season.',
    content:
      'A quick look at furoshiki cloth, kraft paper, and other trends set to define next season. Still finishing this one up — check back soon for the full piece.',
    coverImage: img('blog-5'),
    status: BlogPostStatus.DRAFT,
    publishedAt: null,
  },
];
