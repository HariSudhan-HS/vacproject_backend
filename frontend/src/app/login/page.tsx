"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { request, type User } from "@/lib/api";
import { useApp } from "@/components/providers";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser, notify } = useApp();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await request<{ token: string; user: User }>("/auth/login", { method: "POST", body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
      localStorage.setItem("food-token", result.token);
      await refreshUser(); notify("Welcome back!"); router.push(result.user.role === "admin" ? "/admin" : "/");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not sign in"); }
    finally { setBusy(false); }
  }
  return <main className="auth-shell"><section className="auth-card"><span className="eyebrow">Welcome back</span><h1>Good to see you.</h1><p>Sign in to find something delicious and pick up where you left off.</p>{error && <div className="notice">{error}</div>}<form className="form-stack" onSubmit={submit}><div className="form-field"><label htmlFor="email">Email address</label><input id="email" className="form-input" name="email" type="email" required autoComplete="email" /></div><div className="form-field"><label htmlFor="password">Password</label><input id="password" className="form-input" name="password" type="password" required autoComplete="current-password" /></div><button className="primary-button" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button></form><p className="auth-foot">New to crave? <Link href="/register">Create an account</Link></p></section></main>;
}
