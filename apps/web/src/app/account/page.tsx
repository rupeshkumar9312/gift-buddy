"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageBanner } from "@/components/PageBanner";
import { useAuth } from "@/context/AuthContext";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary";

// Shared by the "Sign In with phone" toggle and the "Register" tab — sign-up
// is phone-only now, so both paths funnel through the same request-code /
// verify-code flow. Whether name fields are needed is only known after
// requesting the code (the phone might already belong to an account).
function PhoneOtpFlow({ onSuccess }: { onSuccess: () => void }) {
  const { requestOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await requestOtp(phone.trim());
      setIsNewUser(result.isNewUser);
      // Non-production only — the API skips Twilio and hands the code back
      // directly so the flow can be tested without a live SMS account.
      setDevOtp(result.devOtp ?? null);
      setCode(result.devOtp ?? "");
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send a code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await verifyOtp(
        phone.trim(),
        code.trim(),
        isNewUser ? { firstName: firstName.trim(), lastName: lastName.trim() } : undefined
      );
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't verify that code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "phone") {
    return (
      <form className="flex flex-col gap-4" onSubmit={handleRequestCode}>
        <div>
          <label className="mb-1.5 block text-sm text-muted">Mobile number</label>
          <input
            required
            name="phone"
            type="tel"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
        </div>
        {error && (
          <p className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm text-primary">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-primary py-3.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Sending code…" : "Send Code"}
        </button>
      </form>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleVerifyCode}>
      <p className="text-sm text-muted">
        We sent a 6-digit code to <span className="text-ink">{phone}</span>.{" "}
        <button
          type="button"
          onClick={() => {
            setStep("phone");
            setError(null);
          }}
          className="text-primary hover:underline"
        >
          Change number
        </button>
      </p>
      {devOtp && (
        <p className="rounded-xl border border-dashed border-line bg-cream px-4 py-2.5 text-sm text-muted">
          Dev mode — no SMS was sent. Your code is{" "}
          <span className="font-medium text-ink">{devOtp}</span>.
        </p>
      )}
      {isNewUser && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm text-muted">First name</label>
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-muted">Last name</label>
            <input
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      )}
      <div>
        <label className="mb-1.5 block text-sm text-muted">6-digit code</label>
        <input
          required
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={inputClass}
        />
      </div>
      {error && (
        <p className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm text-primary">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="mt-2 rounded-full bg-primary py-3.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Verifying…" : isNewUser ? "Verify & Create Account" : "Verify & Sign In"}
      </button>
    </form>
  );
}

export default function AccountPage() {
  const { user, isLoading, login, logout } = useAuth();
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [signInMethod, setSignInMethod] = useState<"password" | "phone">("password");
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

          {tab === "signin" ? (
            signInMethod === "password" ? (
              <form className="flex flex-col gap-4" onSubmit={handleSignIn}>
                <div>
                  <label className="mb-1.5 block text-sm text-muted">Email</label>
                  <input required name="email" type="email" className={inputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-muted">Password</label>
                  <input required name="password" type="password" className={inputClass} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-muted">
                    <input type="checkbox" className="h-4 w-4 accent-[#be7374]" />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSignInMethod("phone");
                      setError(null);
                    }}
                    className="text-primary hover:underline"
                  >
                    Sign in with phone instead
                  </button>
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
              <div className="flex flex-col gap-4">
                <PhoneOtpFlow key="signin" onSuccess={() => router.push("/")} />
                <button
                  type="button"
                  onClick={() => setSignInMethod("password")}
                  className="text-center text-sm text-primary hover:underline"
                >
                  Use email &amp; password instead
                </button>
              </div>
            )
          ) : (
            <div className="flex flex-col gap-4">
              <PhoneOtpFlow key="register" onSuccess={() => router.push("/")} />
              <p className="text-xs leading-relaxed text-muted">
                Your personal data will be used to support your experience throughout this
                website, and for other purposes described in our privacy policy.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
