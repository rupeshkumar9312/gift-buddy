"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { adminLogin, adminLogout, adminRefresh, type AdminUser } from "@/lib/api";

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
