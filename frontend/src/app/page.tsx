"use client";

import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FoodCard } from "@/components/food-card";
import { request, type Category, type Food } from "@/lib/api";

export default function HomePage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([
      request<Food[]>("/foods?limit=30").then(setFoods),
      request<Category[]>("/categories").then(setCategories),
    ]).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load the menu"))
      .finally(() => setLoading(false));
  }, []);
  const filtered = useMemo(() => foods.filter((food) => {
    const categoryName = typeof food.category === "string" ? food.category : food.category?.name;
    return (!category || categoryName === category || (typeof food.category === "object" && food.category?._id === category))
      && `${food.name} ${food.description}`.toLowerCase().includes(search.toLowerCase());
  }), [foods, category, search]);
  return <>
    <main>
      <section className="hero">
        <div><span className="eyebrow">Good food. Great mood.</span><h1>Your next<br />favourite is<br /><em>just a bite away.</em></h1><p className="hero-copy">Thoughtful ingredients, recipes made with love, and the little moments that make every meal worth looking forward to.</p><Link className="hero-cta" href="#menu">Explore the menu <ArrowRight size={16} /></Link></div>
        <div className="hero-art"><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85" alt="Freshly prepared colourful meal" /><span className="hero-note">Made fresh, just for you ✨</span></div>
      </section>
      <section className="menu-section" id="menu">
        <div className="section-top"><div><span className="eyebrow">Made to make your day</span><h2>Find your flavour</h2></div><div className="food-tools"><label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search dishes..." aria-label="Search dishes" /></label><select className="category-select" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category"><option value="">All categories</option>{categories.map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}</select></div></div>
        {loading ? <div className="loading-state">Finding the good stuff...</div> : error ? <div className="notice">{error}</div> : filtered.length ? <div className="food-grid">{filtered.map((food) => <FoodCard key={food._id} food={food} />)}</div> : <div className="empty-state"><h2>No dishes found</h2><p>Try another search or category.</p></div>}
      </section>
    </main>
    <footer className="footer">Made with care, served with a little extra joy. © {new Date().getFullYear()} crave.</footer>
  </>;
}
