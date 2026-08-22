"use client";

import Link from "next/link";
import { PageBanner } from "@/components/PageBanner";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
  const { user, logout } = useAuth();

  return (
    <>
      <PageBanner title="My Account" crumbs={[{ label: "Home", href: "/" }, { label: "My Account" }]} />
      <AuthGate title="Sign in to your account" message="Continue with Google — it only takes a few seconds.">
        {user && (
          <div className="container-page flex justify-center py-14">
            <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 text-center">
              <p className="text-sm text-muted">Signed in as</p>
              <p className="mt-1 text-lg font-medium text-ink">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-muted">{user.email ?? user.phone}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/account/orders"
                  className="rounded-full bg-primary px-8 py-3 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark"
                >
                  Order History
                </Link>
                <button
                  onClick={() => logout()}
                  className="rounded-full border border-ink px-8 py-3 text-sm font-medium uppercase tracking-wide transition hover:border-primary hover:text-primary"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </AuthGate>
    </>
  );
}
