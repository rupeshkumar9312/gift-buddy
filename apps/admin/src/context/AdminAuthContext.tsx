"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { adminLogin, adminLogout, adminRefresh, attachAdminLoginLocation, type AdminUser } from "@/lib/api";

// Fired in the background right after a successful admin login — never
// awaited, since the browser's geolocation permission prompt is
// user-interactive and can take anywhere from instant to "never" (left
// unanswered). The login itself already has an IP-based location recorded
// server-side; this just upgrades that same audit row to a precise GPS fix
// if the prompt is granted. A denial or timeout does nothing further.
function captureLoginLocation(accessToken: string, loginActivityId: number | undefined) {
  if (!loginActivityId) return;
  if (typeof navigator === "undefined" || !navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      attachAdminLoginLocation(accessToken, loginActivityId, {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }).catch(() => undefined);
    },
    () => undefined,
    { maximumAge: 5 * 60 * 1000, timeout: 10_000 }
  );
}

type AdminAuthContextValue = {
  admin: AdminUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminRefresh()
      .then((data) => {
        setAdmin(data.admin);
        setAccessToken(data.accessToken);
      })
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const data = await adminLogin(email, password);
    setAdmin(data.admin);
    setAccessToken(data.accessToken);
    captureLoginLocation(data.accessToken, data.loginActivityId);
  };

  const logout = async () => {
    if (accessToken) {
      await adminLogout(accessToken).catch(() => undefined);
    }
    setAdmin(null);
    setAccessToken(null);
  };

  const hasPermission = (permission: string) => admin?.permissions.includes(permission) ?? false;

  return (
    <AdminAuthContext.Provider
      value={{ admin, accessToken, isLoading, login, logout, hasPermission }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
