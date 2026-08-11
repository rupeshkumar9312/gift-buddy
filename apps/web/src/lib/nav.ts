export const mainNav = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  {
    label: "Pages",
    href: "/about",
    children: [
      { label: "About Us", href: "/about" },
      { label: "FAQ", href: "/faq" },
      { label: "Track Orders", href: "/track-orders" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const footerInfoLinks = [
  { label: "My Account", href: "/account" },
  { label: "Track Orders", href: "/track-orders" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Shipping & Returns", href: "/faq" },
];

export const footerServiceLinks = [
  { label: "Contact Us", href: "/contact" },
  { label: "How To Order", href: "/faq" },
  { label: "FAQ", href: "/faq" },
  { label: "About Us", href: "/about" },
];
