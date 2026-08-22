"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  Heart,
  Mail,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { Logo } from "./Logo";
import { mainNav } from "@/lib/nav";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/format";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount, subtotal, wishlist, openCart } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white">
      {/* Top bar */}
      <div className="hidden border-b border-line bg-cream lg:block">
        <div className="container-page flex h-10 items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <Mail size={13} />
            <span>hello@giftbuddy.com</span>
            <span className="mx-2 h-3 w-px bg-line" />
            <Phone size={13} />
            <span>7599031402</span>
          </div>
          <div className="flex items-center gap-5">
            <span>Free standard shipping on all orders over {formatMoney(99)}</span>
            <span className="h-3 w-px bg-line" />
            <Link href="/about" className="hover:text-primary">About Us</Link>
            <Link href="/track-orders" className="hover:text-primary">Track Orders</Link>
            <Link href="/faq" className="hover:text-primary">FAQ</Link>
          </div>
        </div>
      </div>

      {/* Main row */}
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center text-ink lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <Logo />

        <div className="relative hidden flex-1 max-w-md md:block">
          <input
            type="search"
            placeholder="Search for gifts..."
            className="w-full rounded-full border border-line bg-cream/60 py-2.5 pl-5 pr-11 text-sm outline-none transition focus:border-primary"
          />
          <button
            aria-label="Search"
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-dark"
          >
            <Search size={15} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen((s) => !s)}
            className="flex h-10 w-10 items-center justify-center text-ink transition hover:text-primary md:hidden"
            aria-label="Toggle search"
          >
            <Search size={19} />
          </button>
          <Link
            href="/account"
            className="hidden h-10 w-10 items-center justify-center text-ink transition hover:text-primary sm:flex"
            aria-label="Account"
          >
            <User size={19} />
          </Link>
          <Link
            href="/wishlist"
            className="relative flex h-10 w-10 items-center justify-center text-ink transition hover:text-primary"
            aria-label="Wishlist"
          >
            <Heart size={19} />
            {wishlist.length > 0 && (
              <span className="absolute right-0 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-white">
                {wishlist.length}
              </span>
            )}
          </Link>
          <button
            onClick={openCart}
            className="relative ml-1 flex items-center gap-2 rounded-full border border-line py-2 pl-3 pr-4 text-ink transition hover:border-primary hover:text-primary"
            aria-label="Cart"
          >
            <span className="relative">
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span className="absolute -right-1.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-white">
                  {itemCount}
                </span>
              )}
            </span>
            <span className="hidden text-sm font-medium sm:inline">{formatMoney(subtotal)}</span>
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-line px-4 py-3 md:hidden">
          <div className="relative">
            <input
              type="search"
              placeholder="Search for gifts..."
              className="w-full rounded-full border border-line bg-cream/60 py-2.5 pl-5 pr-11 text-sm outline-none focus:border-primary"
            />
            <button className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white">
              <Search size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Nav row */}
      <nav className="hidden border-t border-line lg:block">
        <div className="container-page flex h-12 items-center justify-center gap-9">
          {mainNav.map((item) => (
            <div key={item.label} className="group relative h-full">
              <Link
                href={item.href}
                className="flex h-12 items-center gap-1 text-[13px] font-medium uppercase tracking-wide text-ink transition hover:text-primary"
              >
                {item.label}
                {item.children && <ChevronDown size={13} />}
              </Link>
              {item.children && (
                <div className="invisible absolute left-1/2 top-full z-10 w-56 -translate-x-1/2 rounded-xl border border-line bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block rounded-lg px-4 py-2.5 text-sm text-ink transition hover:bg-cream hover:text-primary"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-5">
          <Logo />
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-cream"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col px-3 py-4">
          {mainNav.map((item) => (
            <div key={item.label} className="border-b border-line/70 py-1">
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-3 text-sm font-medium uppercase tracking-wide text-ink"
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="flex flex-col pb-2">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="px-6 py-2 text-sm text-muted transition hover:text-primary"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link
            href="/account"
            onClick={() => setMobileOpen(false)}
            className="mt-3 px-3 py-3 text-sm font-medium uppercase tracking-wide text-ink"
          >
            My Account
          </Link>
        </div>
      </aside>
    </header>
  );
}
