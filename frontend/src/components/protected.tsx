"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "./providers";

export function Protected({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) {
  const { user, loading } = useApp();
  const router = useRouter();
  useEffect(() => {
    if (!loading && (!user || (admin && user.role !== "admin"))) router.replace("/login");
  }, [loading, user, admin, router]);
  if (loading || !user || (admin && user.role !== "admin")) return <div className="loading-state">Checking your account...</div>;
  return <>{children}</>;
}
