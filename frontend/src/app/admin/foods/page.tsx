"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { request, type Category, type Food } from "@/lib/api";
import { useApp } from "@/components/providers";

export default function AdminFoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Food | null>(null);
  const { notify } = useApp();
  const load = useCallback(async () => {
    const [foodResult, categoryResult] = await Promise.all([request<Food[]>("/foods?limit=100"), request<Category[]>("/categories")]);
    setFoods(foodResult); setCategories(categoryResult);
  }, []);
  useEffect(() => { load().catch((error: unknown) => notify(error instanceof Error ? error.message : "Could not load menu")); }, [load, notify]);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    try {
      await request(editing ? `/foods/${editing._id}` : "/foods", { method: editing ? "PATCH" : "POST", body: JSON.stringify({ ...body, price: Number(body.price) }) });
      setEditing(null); (event.target as HTMLFormElement).reset(); await load(); notify("Menu item saved");
    } catch (error) { notify(error instanceof Error ? error.message : "Could not save menu item"); }
  }
  async function remove(id: string) {
    if (!window.confirm("Delete this menu item?")) return;
    try { await request(`/foods/${id}`, { method: "DELETE" }); await load(); notify("Menu item deleted"); }
    catch (error) { notify(error instanceof Error ? error.message : "Could not delete item"); }
  }
  return <><div className="panel" style={{ marginBottom: 18 }}><div className="admin-toolbar"><h2>{editing ? "Edit menu item" : "Add a dish"}</h2>{editing && <button className="table-action" onClick={() => setEditing(null)}>Cancel edit</button>}</div><form className="inline-form" onSubmit={save}><input className="form-input" name="name" placeholder="Dish name" defaultValue={editing?.name} required /><input className="form-input" name="price" type="number" min="1" placeholder="Price (₹)" defaultValue={editing?.price} required /><select className="form-select" name="category" defaultValue={typeof editing?.category === "object" ? editing.category._id : editing?.category} required><option value="">Choose category</option>{categories.map((item) => <option value={item._id} key={item._id}>{item.name}</option>)}</select><input className="form-input" name="image" placeholder="Image URL (optional)" defaultValue={editing?.image} /><textarea className="form-area span-two" name="description" placeholder="A short description" defaultValue={editing?.description} required /><button className="primary-button span-two"><Plus size={14} style={{ verticalAlign: "middle", marginRight: 5 }} />Save item</button></form></div><div className="panel table-scroll"><div className="admin-toolbar"><h2>Menu items</h2><span>{foods.length} dishes</span></div><table className="data-table"><thead><tr><th>Dish</th><th>Category</th><th>Price</th><th>Actions</th></tr></thead><tbody>{foods.map((food) => <tr key={food._id}><td>{food.name}</td><td>{typeof food.category === "string" ? food.category : food.category?.name}</td><td>₹{food.price}</td><td><button className="table-action" onClick={() => setEditing(food)}>Edit</button><button className="table-action" aria-label={`Delete ${food.name}`} onClick={() => remove(food._id)}><Trash2 size={14} /></button></td></tr>)}</tbody></table></div></>;
}
