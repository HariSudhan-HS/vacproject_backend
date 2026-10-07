"use client";

import { useCallback, useEffect, useState } from "react";
import { request, type User } from "@/lib/api";
import { useApp } from "@/components/providers";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const { notify } = useApp();
  const load = useCallback(async () => { const result = await request<User[]>("/admin/users"); setUsers(result); }, []);
  useEffect(() => { load().catch((error: unknown) => notify(error instanceof Error ? error.message : "Could not load users")); }, [load, notify]);
  async function setRole(user: User, role: User["role"]) {
    try { await request(`/admin/users/${user.id}/role`, { method: "PATCH", body: JSON.stringify({ role }) }); await load(); notify("Customer role updated"); }
    catch (error) { notify(error instanceof Error ? error.message : "Could not update user"); }
  }
  async function remove(user: User) {
    if (!window.confirm(`Remove ${user.name}'s account?`)) return;
    try { await request(`/admin/users/${user.id}`, { method: "DELETE" }); await load(); notify("Account removed"); }
    catch (error) { notify(error instanceof Error ? error.message : "Could not remove account"); }
  }
  return <div className="panel table-scroll"><div className="admin-toolbar"><h2>Customers</h2><span>{users.length} accounts</span></div><table className="data-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td><select className="form-select" value={user.role} aria-label={`Role for ${user.name}`} onChange={(event) => setRole(user, event.target.value as User["role"])}><option value="customer">Customer</option><option value="admin">Admin</option></select></td><td><button className="table-action" onClick={() => remove(user)}>Remove</button></td></tr>)}</tbody></table></div>;
}
