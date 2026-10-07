"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { request, type User } from "@/lib/api";
import { useApp } from "@/components/providers";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser, notify } = useApp();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await request<{ token: string; user: User }>("/auth/register", { method: "POST", body: JSON.stringify({ name: form.get("name"), email: form.get("email"), password: form.get("password") }) });
      localStorage.setItem("food-token", result.token);
      await refreshUser(); notify("Your account is ready!"); router.push("/");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create your account"); }
    finally { setBusy(false); }
  }
  return <main className="auth-shell"><section className="auth-card"><span className="eyebrow">A little something delicious</span><h1>Come on in.</h1><p>Create an account and let us take care of your next meal.</p>{error && <div className="notice">{error}</div>}<form className="form-stack" onSubmit={submit}><div className="form-field"><label htmlFor="name">Your name</label><input id="name" className="form-input" name="name" required minLength={2} autoComplete="name" /></div><div className="form-field"><label htmlFor="email">Email address</label><input id="email" className="form-input" name="email" type="email" required autoComplete="email" /></div><div className="form-field"><label htmlFor="password">Password</label><input id="password" className="form-input" name="password" type="password" required minLength={8} autoComplete="new-password" /></div><button className="primary-button" disabled={busy}>{busy ? "Creating account..." : "Create account"}</button></form><p className="auth-foot">Already have an account? <Link href="/login">Sign in</Link></p></section></main>;
}
