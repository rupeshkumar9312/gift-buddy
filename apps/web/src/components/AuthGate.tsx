"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { Spinner } from "./Spinner";

export function AuthGate({
  title = "Sign in to keep browsing",
  message = "One tap with Google and you're in — no forms, no passwords.",
  children,
}: {
  title?: string;
  message?: string;
  children: React.ReactNode;
}) {
  const { user, isLoading, loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleCredential = async (idToken: string) => {
    setError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle(idToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't sign in with Google.");
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container-page flex min-h-[40vh] items-center justify-center py-20">
        <Spinner size={28} className="text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-page flex min-h-[40vh] items-center justify-center py-20">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cream text-primary">
            <Lock size={20} />
          </span>
          <h2 className="mt-4 text-xl font-medium text-ink">{title}</h2>
          <p className="mt-2 text-sm text-muted">{message}</p>

          {error && (
            <p className="mt-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm text-primary">
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-center">
            <GoogleSignInButton onCredential={handleGoogleCredential} />
          </div>

          {submitting && (
            <div className="mt-4 flex justify-center">
              <Spinner size={18} className="text-primary" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
