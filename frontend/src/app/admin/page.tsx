"use client";

import { useEffect, useState } from "react";
import { request } from "@/lib/api";
import { useApp } from "@/components/providers";

type Dashboard = { orders: number; users: number; foods: number; revenue: number };
export default function AdminDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);
  const { notify } = useApp();
  useEffect(() => { request<Dashboard>("/admin/dashboard").then(setData).catch((error: unknown) => notify(error instanceof Error ? error.message : "Could not load dashboard")); }, [notify]);
  return <><div className="stat-grid">{[["Orders", data?.orders], ["Customers", data?.users], ["Menu items", data?.foods]].map(([label, value]) => <article className="stat-card" key={label as string}><span>{label}</span><strong>{value ?? "—"}</strong></article>)}</div><div className="panel"><div className="admin-toolbar"><h2>Revenue</h2><strong>₹{data?.revenue ?? "—"}</strong></div><p style={{ color: "var(--muted)", fontSize: 12, margin: 0 }}>Lifetime order revenue</p></div></>;
}
