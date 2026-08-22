"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageBanner } from "@/components/PageBanner";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { useAuth } from "@/context/AuthContext";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary";

export default function AccountPage() {
  const { user, isLoading, login, register, loginWithGoogle, logout } = useAuth();
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      await login(String(form.get("email")), String(form.get("password")));
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    if (password !== String(form.get("confirmPassword"))) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await register({
        email: String(form.get("email")),
        password,
        firstName: String(form.get("firstName")),
        lastName: String(form.get("lastName")),
      });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleCredential = async (idToken: string) => {
    setError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle(idToken);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't sign in with Google.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <PageBanner title="My Account" crumbs={[{ label: "Home", href: "/" }, { label: "My Account" }]} />
        <div className="container-page py-14 text-center text-sm text-muted">Loading…</div>
      </>
    );
  }

  if (user) {
    return (
      <>
        <PageBanner title="My Account" crumbs={[{ label: "Home", href: "/" }, { label: "My Account" }]} />
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
      </>
    );
  }

  return (
    <>
      <PageBanner title="My Account" crumbs={[{ label: "Home", href: "/" }, { label: "My Account" }]} />

      <div className="container-page flex justify-center py-14">
        <div className="w-full max-w-md">
          <div className="mb-8 flex rounded-full bg-cream p-1">
            <button
              onClick={() => {
                setTab("signin");
                setError(null);
              }}
              className={`flex-1 rounded-full py-2.5 text-sm font-medium uppercase tracking-wide transition ${
                tab === "signin" ? "bg-primary text-white" : "text-muted"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab("register");
                setError(null);
              }}
              className={`flex-1 rounded-full py-2.5 text-sm font-medium uppercase tracking-wide transition ${
                tab === "register" ? "bg-primary text-white" : "text-muted"
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <p className="mb-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm text-primary">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-4">
            <GoogleSignInButton onCredential={handleGoogleCredential} />
            <p className="text-center text-xs uppercase tracking-wide text-muted">or</p>

            {tab === "signin" ? (
              <form className="flex flex-col gap-4" onSubmit={handleSignIn}>
                <div>
                  <label className="mb-1.5 block text-sm text-muted">Email</label>
                  <input required name="email" type="email" className={inputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-muted">Password</label>
                  <input required name="password" type="password" className={inputClass} />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 rounded-full bg-primary py-3.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Signing in…" : "Login"}
                </button>
              </form>
            ) : (
              <form className="flex flex-col gap-4" onSubmit={handleRegister}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm text-muted">First name</label>
                    <input required name="firstName" className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-muted">Last name</label>
                    <input required name="lastName" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-muted">Email</label>
                  <input required name="email" type="email" className={inputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-muted">Password</label>
                  <input required name="password" type="password" minLength={8} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-muted">Confirm password</label>
                  <input required name="confirmPassword" type="password" minLength={8} className={inputClass} />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 rounded-full bg-primary py-3.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Creating account…" : "Create Account"}
                </button>
                <p className="text-xs leading-relaxed text-muted">
                  Your personal data will be used to support your experience throughout this
                  website, and for other purposes described in our privacy policy.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
