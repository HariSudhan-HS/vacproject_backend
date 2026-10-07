"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, UtensilsCrossed } from "lucide-react";
import { useApp } from "./providers";

export function Header() {
  const { user, signOut } = useApp();
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link href="/" className="brand"><span className="brand-icon"><UtensilsCrossed size={19} /></span>crave<span className="brand-dot">.</span></Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link className={pathname === "/" ? "active" : ""} href="/">Discover</Link>
          {user && <Link className={pathname === "/orders" ? "active" : ""} href="/orders">My orders</Link>}
          {user?.role === "admin" && <Link href="/admin">Admin</Link>}
        </nav>
        <div className="nav-actions">
          <Link href="/cart" aria-label="Shopping cart" className="cart-link"><ShoppingBag size={19} /></Link>
          {user ? <><Link className="account-link" href="/profile">{user.name.split(" ")[0]}</Link><button className="nav-button" onClick={signOut}>Sign out</button></> : <Link className="nav-button nav-login" href="/login">Sign in</Link>}
        </div>
      </div>
    </header>
  );
}
