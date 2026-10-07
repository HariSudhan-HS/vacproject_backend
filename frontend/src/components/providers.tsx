"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ApiError, request, type User } from "@/lib/api";

type AppContextValue = {
  user: User | null;
  loading: boolean;
  toast: string;
  notify: (message: string) => void;
  refreshUser: () => Promise<void>;
  signOut: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }, []);
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("food-token");
    if (!token) { setUser(null); return; }
    try {
      const result = await request<{ user: User }>("/auth/me");
      setUser(result.user);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        localStorage.removeItem("food-token");
        setUser(null);
        return;
      }
      throw error;
    }
  }, []);
  useEffect(() => {
    refreshUser().catch((error: unknown) => notify(error instanceof Error ? error.message : "Could not verify your session"))
      .finally(() => setLoading(false));
  }, [refreshUser, notify]);
  const signOut = useCallback(() => {
    localStorage.removeItem("food-token");
    setUser(null);
    window.location.assign("/");
  }, []);
  const value = useMemo(() => ({ user, loading, toast, notify, refreshUser, signOut }), [user, loading, toast, notify, refreshUser, signOut]);
  return <AppContext.Provider value={value}>{children}{toast && <div className="toast" role="status">{toast}</div>}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within Providers");
  return context;
}
