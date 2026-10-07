"use client";

import { useCallback, useEffect, useState } from "react";
import { Protected } from "@/components/protected";
import { request, type Order } from "@/lib/api";
import { useApp } from "@/components/providers";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { notify } = useApp();
  const load = useCallback(async () => {
    try { const result = await request<Order[]>("/orders/mine"); setOrders(result); }
    catch (error) { notify(error instanceof Error ? error.message : "Could not load orders"); }
    finally { setLoading(false); }
  }, [notify]);
  useEffect(() => { load(); }, [load]);
  return <Protected><main className="page-container"><div className="page-heading"><span className="eyebrow">A little history</span><h1>Your orders</h1><p>All your good meals, in one place.</p></div>{loading ? <div className="loading-state">Loading your orders...</div> : orders.length ? <div className="panel">{orders.map((order) => <article key={order._id} style={{ padding: "17px 0", borderBottom: "1px solid var(--line)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}><strong>Order #{order._id.slice(-7).toUpperCase()}</strong><span className="status-pill">{order.status}</span></div><p style={{ color: "var(--muted)", fontSize: 12, margin: "8px 0" }}>{order.items.map((item) => `${item.quantity} × ${item.name}`).join(" · ")}</p><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span style={{ color: "var(--muted)" }}>{new Date(order.createdAt).toLocaleString()}</span><strong>₹{order.total}</strong></div></article>)}</div> : <div className="empty-state"><h2>Nothing cooking yet</h2><p>Your next favourite meal is waiting to be found.</p></div>}</main></Protected>;
}
