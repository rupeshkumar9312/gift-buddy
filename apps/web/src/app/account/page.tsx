"use client";

import { useState } from "react";
import { PageBanner } from "@/components/PageBanner";

export default function AccountPage() {
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const inputClass =
    "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <>
      <PageBanner title="My Account" crumbs={[{ label: "Home", href: "/" }, { label: "My Account" }]} />

      <div className="container-page flex justify-center py-14">
        <div className="w-full max-w-md">
          <div className="mb-8 flex rounded-full bg-cream p-1">
            <button
              onClick={() => setTab("signin")}
              className={`flex-1 rounded-full py-2.5 text-sm font-medium uppercase tracking-wide transition ${
                tab === "signin" ? "bg-primary text-white" : "text-muted"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 rounded-full py-2.5 text-sm font-medium uppercase tracking-wide transition ${
                tab === "register" ? "bg-primary text-white" : "text-muted"
              }`}
            >
              Register
            </button>
          </div>

          {tab === "signin" ? (
            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="mb-1.5 block text-sm text-muted">Username or email</label>
                <input required className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-muted">Password</label>
                <input required type="password" className={inputClass} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted">
                  <input type="checkbox" className="h-4 w-4 accent-[#be7374]" />
                  Remember me
                </label>
                <a href="#" className="text-primary hover:underline">
                  Lost your password?
                </a>
              </div>
              <button
                type="submit"
                className="mt-2 rounded-full bg-primary py-3.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark"
              >
                Login
              </button>
            </form>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="mb-1.5 block text-sm text-muted">Username</label>
                <input required className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-muted">Email address</label>
                <input required type="email" className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-muted">Password</label>
                <input required type="password" className={inputClass} />
              </div>
              <p className="text-xs leading-relaxed text-muted">
                Your personal data will be used to support your experience throughout this
                website, and for other purposes described in our privacy policy.
              </p>
              <button
                type="submit"
                className="mt-2 rounded-full bg-primary py-3.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark"
              >
                Create an Account
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
