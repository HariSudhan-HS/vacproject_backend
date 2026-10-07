"use client";

import { FormEvent, useState } from "react";
import { Protected } from "@/components/protected";
import { useApp } from "@/components/providers";
import { request, type User } from "@/lib/api";

export default function ProfilePage() {
  const { user, refreshUser, notify } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      await request<{ user: User }>("/auth/me", { method: "PATCH", body: JSON.stringify({ name: form.get("name") }) });
      await refreshUser(); notify("Profile updated");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update profile"); }
    finally { setBusy(false); }
  }
  return <Protected><main className="page-container"><div className="page-heading"><span className="eyebrow">Your account</span><h1>Profile</h1><p>Keep your details up to date.</p></div><section className="panel" style={{ maxWidth: 560 }}>{error && <div className="notice">{error}</div>}<form className="form-stack" onSubmit={submit}><div className="form-field"><label htmlFor="name">Name</label><input className="form-input" id="name" name="name" defaultValue={user?.name} required minLength={2} /></div><div className="form-field"><label htmlFor="email">Email address</label><input className="form-input" id="email" value={user?.email ?? ""} disabled /></div><button className="primary-button" disabled={busy}>{busy ? "Saving..." : "Save changes"}</button></form></section></main></Protected>;
}
