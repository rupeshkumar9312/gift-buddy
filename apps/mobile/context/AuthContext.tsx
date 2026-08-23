import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { API_URL } from "@/lib/api";

// Native Google Sign In requires a custom development build (Play Services
// isn't available in Expo Go) — see the note in apps/mobile/AGENTS.md/README
// or ask before assuming this works there. The token this returns is always
// audienced to `webClientId`, regardless of which platform-specific OAuth
// client Play Services used to authenticate the device — so the backend's
// GOOGLE_CLIENT_ID (unchanged) still verifies it correctly.
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "";
if (GOOGLE_CLIENT_ID) {
  GoogleSignin.configure({ webClientId: GOOGLE_CLIENT_ID });
}

export type AuthUser = {
  id: number;
  email: string | null;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  isGoogleSignInReady: boolean;
  promptGoogleSignIn: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message.join(", ");
    if (body.message) return body.message;
  } catch {
    // fall through to generic message
  }
  return "Something went wrong. Please try again.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // React (Strict Mode, or any effect re-run) can double-invoke this on
  // mount. Without this guard, that fires two concurrent /auth/refresh
  // calls using the *same* not-yet-rotated refresh-token cookie. The
  // refresh endpoint rotates the token on every call and revokes the whole
  // session if it ever sees a token that doesn't match the latest stored
  // hash (its replay-attack defense) — so the second of those two calls
  // looks exactly like a replayed/stolen token and wipes out the session
  // the first call had just legitimately renewed. The ref survives a
  // synthetic double-invoke (same component instance), so the call only
  // actually fires once per real mount.
  const hasAttemptedRefresh = useRef(false);

  // On first load, try to silently restore a session from the refresh cookie
  // — the native networking stack persists cookies the same way a browser
  // does, so this works the same as it does on web (see the cookie note in
  // lib/api.ts).
  useEffect(() => {
    if (hasAttemptedRefresh.current) return;
    hasAttemptedRefresh.current = true;

    fetch(`${API_URL}/auth/refresh`, { method: "POST", credentials: "include" })
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as { user: AuthUser; accessToken: string };
        setUser(data.user);
        setAccessToken(data.accessToken);
      })
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    const data = (await res.json()) as { user: AuthUser; accessToken: string };
    setUser(data.user);
    setAccessToken(data.accessToken);
  };

  const register: AuthContextValue["register"] = async (input) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    const data = (await res.json()) as { user: AuthUser; accessToken: string };
    setUser(data.user);
    setAccessToken(data.accessToken);
  };

  const loginWithGoogle = async (idToken: string) => {
    const res = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    const data = (await res.json()) as { user: AuthUser; accessToken: string };
    setUser(data.user);
    setAccessToken(data.accessToken);
  };

  const promptGoogleSignIn = async () => {
    if (!GOOGLE_CLIENT_ID) {
      throw new Error("Google sign-in is not configured for this app.");
    }
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) {
        // User backed out of the account picker — not an error, just a no-op.
        return;
      }
      const idToken = response.data.idToken;
      if (!idToken) {
        throw new Error("Google didn't return a sign-in token. Please try again.");
      }
      await loginWithGoogle(idToken);
    } catch (err) {
      if (isErrorWithCode(err) && err.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      throw err instanceof Error ? err : new Error("Google sign-in failed. Please try again.");
    }
  };

  const logout = async () => {
    if (accessToken) {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${accessToken}` },
      }).catch(() => undefined);
    }
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        register,
        isGoogleSignInReady: Boolean(GOOGLE_CLIENT_ID),
        promptGoogleSignIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
