"use client";

import { useCallback, useEffect, useState } from "react";
import { request, type Order } from "@/lib/api";
import { useApp } from "@/components/providers";

const statuses = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"];
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { notify } = useApp();
  const load = useCallback(async () => { const result = await request<Order[]>("/orders"); setOrders(result); }, []);
  useEffect(() => { load().catch((error: unknown) => notify(error instanceof Error ? error.message : "Could not load orders")); }, [load, notify]);
  async function update(id: string, status: string) {
    try { await request(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); await load(); notify("Order status updated"); }
    catch (error) { notify(error instanceof Error ? error.message : "Could not update order"); }
  }
  return <div className="panel table-scroll"><div className="admin-toolbar"><h2>All orders</h2><span>{orders.length} total</span></div><table className="data-table"><thead><tr><th>Order</th><th>Placed</th><th>Total</th><th>Status</th><th>Update status</th></tr></thead><tbody>{orders.map((order) => <tr key={order._id}><td>#{order._id.slice(-7).toUpperCase()}</td><td>{new Date(order.createdAt).toLocaleDateString()}</td><td>₹{order.total}</td><td><span className="status-pill">{order.status}</span></td><td><select className="form-select" aria-label="Order status" value={order.status} onChange={(event) => update(order._id, event.target.value)}>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></td></tr>)}</tbody></table></div>;
}
