"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

type GoogleCredentialResponse = { credential: string };

// Minimal shape of the Google Identity Services global — there's no
// first-party @types package for it, and pulling in a whole community one
// just for two methods isn't worth it.
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: { theme?: string; size?: string; width?: number; text?: string }
          ) => void;
        };
      };
    };
  }
}

// Renders the real Google-hosted button via Identity Services (not a custom
// lookalike) — it authenticates entirely through Google's own popup/iframe,
// keyed to the "Authorized JavaScript origins" configured on the OAuth
// client, so unlike the mobile app this needs no redirect URI at all.
export function GoogleSignInButton({ onCredential }: { onCredential: (idToken: string) => void }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!scriptLoaded || !buttonRef.current || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => onCredentialRef.current(response.credential),
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      width: buttonRef.current.offsetWidth,
      text: "continue_with",
    });
  }, [scriptLoaded]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={buttonRef} />
    </>
  );
}
