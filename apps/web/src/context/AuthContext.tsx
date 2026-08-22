"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

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
  loginWithGoogle: (idToken: string) => Promise<void>;
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

// Fired in the background right after a successful login/register/Google
// sign-in — never awaited by the caller, since the browser's geolocation
// permission prompt is user-interactive and can take anywhere from
// instant to "never" (left unanswered). The login itself already has an
// IP-based location recorded server-side; this just upgrades that same
// audit row to a precise GPS fix if the prompt is granted. A denial or
// timeout intentionally does nothing further — the IP-based record already
// stands.
function captureLoginLocation(accessToken: string, loginActivityId: number | undefined) {
  if (!loginActivityId) return;
  if (typeof navigator === "undefined" || !navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      fetch(`${API_URL}/auth/login-activity/${loginActivityId}/location`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      }).catch(() => undefined);
    },
    () => undefined,
    { maximumAge: 5 * 60 * 1000, timeout: 10_000 },
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, try to silently restore a session from the refresh cookie.
  useEffect(() => {
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
    const data = (await res.json()) as {
      user: AuthUser;
      accessToken: string;
      loginActivityId?: number;
    };
    setUser(data.user);
    setAccessToken(data.accessToken);
    captureLoginLocation(data.accessToken, data.loginActivityId);
  };

  const register: AuthContextValue["register"] = async (input) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    const data = (await res.json()) as {
      user: AuthUser;
      accessToken: string;
      loginActivityId?: number;
    };
    setUser(data.user);
    setAccessToken(data.accessToken);
    captureLoginLocation(data.accessToken, data.loginActivityId);
  };

  const loginWithGoogle = async (idToken: string) => {
    const res = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));
    const data = (await res.json()) as {
      user: AuthUser;
      accessToken: string;
      loginActivityId?: number;
    };
    setUser(data.user);
    setAccessToken(data.accessToken);
    captureLoginLocation(data.accessToken, data.loginActivityId);
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
      value={{ user, accessToken, isLoading, login, register, loginWithGoogle, logout }}
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
