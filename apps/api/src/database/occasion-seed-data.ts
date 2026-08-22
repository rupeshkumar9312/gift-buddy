// Illustrative examples of the admin-configurable Occasion feature: one
// live now (Raksha Bandhan), one pre-configured but not yet visible to
// shoppers (Diwali, gated by a future startsAt) — demonstrating that an
// admin can set up next month's festival today without it showing early.

const img = (seed: string, w = 1200, h = 500) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export const seedOccasions = [
  {
    slug: 'raksha-bandhan',
    name: 'Raksha Bandhan',
    tagline: 'Celebrate the bond of love',
    description:
      'Thoughtful gifts for the sibling who ties the thread — jewelry, keepsakes, and a few things guaranteed to make them laugh.',
    bannerImage: img('occasion-rakhi'),
    startsAt: null,
    endsAt: null,
    isActive: true,
    sortOrder: 0,
    categorySlugs: ['jewelry-accessories'],
    productSlugs: ['soleil-stretchy-ball-bead-mask-necklace', 'the-bum-box'],
  },
  {
    slug: 'diwali',
    name: 'Diwali',
    tagline: 'Light up someone’s festival',
    description:
      'Festive gifts for the season of lights — set up ahead of time and released automatically when the window opens.',
    bannerImage: img('occasion-diwali'),
    startsAt: daysFromNow(21),
    endsAt: null,
    isActive: true,
    sortOrder: 1,
    categorySlugs: ['occasion-gifts'],
    productSlugs: ['snoopy-with-hearts-garland'],
  },
];
