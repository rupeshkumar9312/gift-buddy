"use client";

import { useAuth } from "@/context/AuthContext";
import { GoogleSignInButton } from "./GoogleSignInButton";

// Unlike AuthGate (which hard-blocks Shop/Product/Occasion/Checkout until
// signed in), this is a soft suggestion on the home page: it renders nothing
// but the floating Google One Tap dialog, and never touches the page's own
// content. Dismissing it is a no-op — the rest of the home page was never
// gated to begin with.
export function HomeSignInPrompt() {
  const { user, isLoading, loginWithGoogle } = useAuth();

  if (isLoading || user) return null;

  const handleGoogleCredential = (idToken: string) => {
    loginWithGoogle(idToken).catch(() => undefined);
  };

  return <GoogleSignInButton onCredential={handleGoogleCredential} showButton={false} />;
}
