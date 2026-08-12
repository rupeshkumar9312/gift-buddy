import type { BlogPost, Testimonial } from "./types";

const img = (seed: string, w = 600, h = 750) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

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

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}
