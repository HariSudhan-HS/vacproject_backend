"use client";

import { Plus, Star, Leaf } from "lucide-react";
import { useApp } from "./providers";
import { imageFor, request, type Food } from "@/lib/api";

export function FoodCard({ food }: { food: Food }) {
  const { user, notify } = useApp();
  async function addToCart() {
    if (!user) { window.location.assign("/login"); return; }
    try {
      await request("/cart/items", { method: "POST", body: JSON.stringify({ foodId: food._id, quantity: 1 }) });
      notify(`${food.name} added to your bag`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not add item");
    }
  }
  return <article className="food-card">
    <div className="food-image-wrap">
      <img className="food-image" src={imageFor(food)} alt={food.name} />
      {food.isVegetarian && <span className="veg-badge"><Leaf size={12} /> Veg</span>}
      <button className="add-button" onClick={addToCart} aria-label={`Add ${food.name} to cart`}><Plus size={20} /></button>
    </div>
    <div className="food-info">
      <div className="food-title-row"><h3>{food.name}</h3><span className="rating"><Star size={13} fill="currentColor" /> {food.rating?.toFixed(1) ?? "4.8"}</span></div>
      <p>{food.description}</p>
      <div className="food-meta"><span>{typeof food.category === "string" ? food.category : food.category?.name}</span><strong>₹{food.price}</strong></div>
    </div>
  </article>;
}
