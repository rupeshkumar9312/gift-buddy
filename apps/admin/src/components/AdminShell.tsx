"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BadgePercent,
  Building2,
  CalendarHeart,
  Gift,
  Image as ImageIcon,
  LayoutDashboard,
  ListTree,
  LogOut,
  Mail,
  MapPinOff,
  Megaphone,
  MessageSquareText,
  Menu,
  Newspaper,
  Package,
  PackageOpen,
  ShoppingCart,
  Star,
  Tag,
  X,
} from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard.read" },
  { href: "/products", label: "Products", icon: Package, permission: "products.read" },
  { href: "/categories", label: "Categories", icon: ListTree, permission: "products.read" },
  { href: "/occasions", label: "Occasions", icon: CalendarHeart, permission: "products.read" },
  { href: "/orders", label: "Orders", icon: ShoppingCart, permission: "orders.read" },
  { href: "/out-of-area-orders", label: "Out-of-Area Requests", icon: MapPinOff, permission: "orders.read" },
  { href: "/coupons", label: "Coupons", icon: Tag, permission: "marketing.write" },
  { href: "/reviews", label: "Reviews", icon: Star, permission: "reviews.moderate" },
  { href: "/blog", label: "Blog", icon: Newspaper, permission: "content.read" },
  { href: "/faqs", label: "FAQs", icon: MessageSquareText, permission: "content.read" },
  { href: "/contact-messages", label: "Contact Inbox", icon: Mail, permission: "content.read" },
  { href: "/settings/home-hero", label: "Home Hero", icon: ImageIcon, permission: "settings.write" },
  { href: "/settings/promo-banners", label: "Promo Banners", icon: Megaphone, permission: "settings.write" },
  { href: "/settings/sale-banners", label: "Sale Banners", icon: BadgePercent, permission: "settings.write" },
  { href: "/settings/gift-kits", label: "Gift Kits", icon: PackageOpen, permission: "settings.write" },
  { href: "/settings/societies", label: "Societies", icon: Building2, permission: "settings.write" },
  // Deliberately not in the nav — reachable only by typing /login-activity
  // directly. The route and its "roles.write" permission gate on the API
  // are both still fully in place.
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { admin, isLoading, hasPermission, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !admin) {
      router.replace("/login");
    }
  }, [isLoading, admin, router]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted">Loading…</div>;
  }

  if (!admin) {
    return null;
  }

  const visibleNav = NAV_ITEMS.filter((item) => hasPermission(item.permission));

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Mobile top bar — the sidebar below is off-canvas on small screens */}
      <header className="flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition hover:bg-cream"
        >
          <Menu size={20} />
        </button>
        <span className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
            <Gift size={14} strokeWidth={2.25} />
          </span>
          GiftBuddy <span className="text-primary">Admin</span>
        </span>
        <span className="h-9 w-9" />
      </header>

      {/* Backdrop for the mobile drawer */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] shrink-0 flex-col border-r border-line bg-white transition-transform duration-300 lg:static lg:z-auto lg:w-60 lg:max-w-none lg:translate-x-0 lg:transition-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2.5 border-b border-line px-5 py-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
              <Gift size={16} strokeWidth={2.25} />
            </span>
            <span className="text-base font-semibold tracking-tight">
              GiftBuddy <span className="text-primary">Admin</span>
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-cream lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {visibleNav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  active ? "bg-primary text-white" : "text-muted hover:bg-cream hover:text-ink"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line p-4">
          <p className="truncate text-sm font-medium text-ink">{admin.name}</p>
          <p className="truncate text-xs text-muted">{admin.role}</p>
          <button
            onClick={() => logout()}
            className="mt-3 flex w-full items-center gap-2 rounded-xl border border-line px-3.5 py-2 text-xs font-medium uppercase tracking-wide text-muted transition hover:border-primary hover:text-primary"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
