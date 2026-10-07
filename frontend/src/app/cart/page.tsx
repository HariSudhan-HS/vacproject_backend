"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Protected } from "@/components/protected";
import { useApp } from "@/components/providers";
import { request, type CartLine } from "@/lib/api";

type CartData = { items: CartLine[] };
export default function CartPage() {
  const { notify } = useApp();
  const [cart, setCart] = useState<CartData>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const load = useCallback(async () => {
    try { const result = await request<CartData>("/cart"); setCart(result); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load().catch((error: unknown) => notify(error instanceof Error ? error.message : "Could not load cart")); }, [load, notify]);
  async function quantity(line: CartLine, value: number) {
    try {
      const foodId = line.food._id;
      if (value <= 0) await request(`/cart/items/${foodId}`, { method: "DELETE" });
      else await request(`/cart/items/${foodId}`, { method: "PATCH", body: JSON.stringify({ quantity: value }) });
      await load();
    } catch (error) { notify(error instanceof Error ? error.message : "Could not update cart"); }
  }
  const subtotal = cart.items.reduce((sum, item) => sum + item.food.price * item.quantity, 0);
  async function checkout() {
    setBusy(true);
    try {         const result = await request<{ _id: string }>("/orders/checkout", { method: "POST", body: JSON.stringify({ deliveryAddress }) }); notify(`Order ${result._id.slice(-6)} placed!`); await load(); window.location.assign("/orders"); }
    catch (error) { notify(error instanceof Error ? error.message : "Could not place order"); }
    finally { setBusy(false); }
  }
  return <Protected><main className="page-container"><div className="page-heading"><span className="eyebrow">The good stuff</span><h1>Your bag</h1><p>Everything you need for a very good meal.</p></div>{loading ? <div className="loading-state">Loading your bag...</div> : !cart.items.length ? <div className="empty-state"><h2>Your bag is taking a breather</h2><p>Let’s find something delicious to fill it with.</p><Link className="hero-cta" href="/">Browse the menu</Link></div> : <div className="cart-layout"><section className="panel">{cart.items.map((line) => <div className="cart-line" key={line.food._id}><div><h3>{line.food.name}</h3><p>₹{line.food.price} each</p></div><div className="quantity-controls"><button onClick={() => quantity(line, line.quantity - 1)} aria-label="Decrease quantity">{line.quantity === 1 ? <Trash2 size={13} /> : <Minus size={13} />}</button><strong>{line.quantity}</strong><button onClick={() => quantity(line, line.quantity + 1)} aria-label="Increase quantity"><Plus size={13} /></button></div><strong>₹{line.food.price * line.quantity}</strong></div>)}</section><aside className="panel"><h2 style={{ fontSize: 19 }}>Order summary</h2><div className="form-field" style={{ margin: "15px 0" }}><label htmlFor="delivery-address">Delivery address</label><textarea id="delivery-address" className="form-area" rows={3} value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} required minLength={8} placeholder="Street address, city, postal code" /></div><div className="summary-row"><span>Subtotal</span><span>₹{subtotal}</span></div><div className="summary-row"><span>Delivery</span><span>Free</span></div><div className="summary-row total"><span>Total</span><span>₹{subtotal}</span></div><button className="primary-button full-width" disabled={busy || deliveryAddress.trim().length < 8} onClick={checkout}>{busy ? "Placing your order..." : "Place order"}</button></aside></div>}</main></Protected>;
}
