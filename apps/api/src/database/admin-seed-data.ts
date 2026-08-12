// Role → permission matrix from docs/backend-admin-analysis.md Section 05.

export const seedPermissions = [
  'dashboard.read',
  'products.read',
  'products.write',
  'orders.read',
  'orders.write',
  'orders.refund',
  'customers.read',
  'marketing.write',
  'reviews.moderate',
  'content.read',
  'content.write',
  'media.write',
  'settings.write',
  'roles.write',
] as const;

export const seedRoles = [
  {
    name: 'Super Admin',
    description: 'Full access to every module.',
    permissions: [...seedPermissions],
  },
  {
    name: 'Catalog Manager',
    description: 'Manages products, categories, marketing, and reviews.',
    permissions: [
      'dashboard.read',
      'products.read',
      'products.write',
      'marketing.write',
      'reviews.moderate',
      'media.write',
    ],
  },
  {
    name: 'Support Agent',
    description: 'Handles orders and customer lookups.',
    permissions: [
      'dashboard.read',
      'orders.read',
      'orders.write',
      'customers.read',
    ],
  },
  {
    name: 'Content Editor',
    description: 'Manages blog, FAQ, and contact inbox content.',
    permissions: [
      'dashboard.read',
      'content.read',
      'content.write',
      'media.write',
    ],
  },
];

// Dev-only seed login — change before anything but local dev.
export const seedSuperAdmin = {
  email: 'admin@giftbuddy.test',
  password: 'admin12345',
  name: 'GiftBuddy Admin',
  roleName: 'Super Admin',
};
