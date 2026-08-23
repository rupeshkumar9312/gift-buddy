"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

type GoogleCredentialResponse = { credential: string };

type GoogleNotification = {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
};

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
            use_fedcm_for_prompt?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: { theme?: string; size?: string; width?: number; text?: string }
          ) => void;
          prompt: (momentListener?: (notification: GoogleNotification) => void) => void;
        };
      };
    };
  }
}

// Renders the real Google-hosted button via Identity Services (not a custom
// lookalike) — it authenticates entirely through Google's own popup/iframe,
// keyed to the "Authorized JavaScript origins" configured on the OAuth
// client, so unlike the mobile app this needs no redirect URI at all.
//
// `autoPrompt` also fires the One Tap floating dialog as soon as the script
// is ready, so signing in doesn't require finding and clicking a button
// first — the rendered button underneath stays as a fallback for when One
// Tap is suppressed (e.g. the user dismissed it recently, or isn't signed
// into a Google account in this browser).
export function GoogleSignInButton({
  onCredential,
  autoPrompt = true,
  showButton = true,
}: {
  onCredential: (idToken: string) => void;
  autoPrompt?: boolean;
  // False for a soft, non-blocking suggestion (e.g. the home page's One Tap
  // nudge) — renders only the floating One Tap dialog, skipping the inline
  // "Continue with Google" button that would otherwise sit in the page flow.
  showButton?: boolean;
}) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  // React's Strict Mode double-invokes effects in dev (setup → cleanup →
  // setup again) to surface non-idempotent effects. Without this guard, that
  // fires prompt() twice back to back — the second call supersedes/aborts
  // the first native FedCM dialog, which looks exactly like the prompt
  // flashing and vanishing within milliseconds. The ref survives across that
  // synthetic double-invoke (same component instance), so it only actually
  // runs once per real mount, and still resets fresh on each new navigation.
  const initializedRef = useRef(false);
  // next/script's onLoad only fires for the mount that actually triggers the
  // first load — Next.js dedupes the <script> tag on later client-side
  // navigations, so a GoogleSignInButton remounted on a different gated page
  // would never see onLoad fire again and scriptLoaded would stay stuck at
  // false until a hard refresh. The lazy initializer covers that case by
  // checking for the already-loaded global at first render.
  const [scriptLoaded, setScriptLoaded] = useState(
    () => typeof window !== "undefined" && Boolean(window.google)
  );

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!scriptLoaded || !window.google || initializedRef.current) return;
    if (showButton && !buttonRef.current) return;
    initializedRef.current = true;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => onCredentialRef.current(response.credential),
      // Classic One Tap leans on a third-party cookie + iframe, which Safari's
      // ITP and Chrome's third-party-cookie phase-out both block — this is
      // the single biggest reason the prompt silently never appears on
      // mobile. FedCM is the browser-native replacement Google now
      // recommends; where it isn't supported (Safari), this flag is a no-op
      // and GSI falls back to the classic flow.
      use_fedcm_for_prompt: true,
    });
    if (showButton && buttonRef.current) {
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: buttonRef.current.offsetWidth,
        text: "continue_with",
      });
    }
    if (autoPrompt) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          console.warn("Google One Tap not displayed:", notification.getNotDisplayedReason());
        } else if (notification.isSkippedMoment()) {
          console.warn("Google One Tap skipped:", notification.getSkippedReason());
        }
      });
    }
  }, [scriptLoaded, autoPrompt, showButton]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      {showButton && <div ref={buttonRef} />}
    </>
  );
}
