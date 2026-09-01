"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "EDITOR" | "VIEWER";
};

export function UsersManager({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [status, setStatus] = useState("");

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("CREATING...");
    const form = event.currentTarget;
    const data = new FormData(form);
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        password: data.get("password"),
        role: data.get("role"),
      }),
    });
    const body = await response.json();
    if (!response.ok) {
      setStatus(body.error || "CREATE FAILED");
      return;
    }
    setUsers((current) => [body, ...current]);
    setStatus("USER CREATED");
    form.reset();
  }

  async function changeRole(user: AdminUser, role: AdminUser["role"]) {
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (response.ok) {
      const updated = await response.json();
      setUsers((current) => current.map((item) => item.id === user.id ? updated : item));
    }
  }

  async function deactivate(user: AdminUser) {
    if (!window.confirm(`Deactivate ${user.email}?`)) return;
    const response = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    if (response.ok) setUsers((current) => current.filter((item) => item.id !== user.id));
    else setStatus((await response.json()).error || "ACTION FAILED");
  }

  return (
    <div>
      <p className="font-mono-label text-cyan">ACCESS CONTROL</p>
      <h1 className="font-display mb-8 text-3xl font-bold">Admin Users</h1>
      <form onSubmit={create} className="technical-panel mb-8 grid gap-4 p-5 md:grid-cols-2">
        <input name="name" required placeholder="Name" className="border border-card-border px-3 py-2" />
        <input name="email" type="email" required placeholder="Email" className="border border-card-border px-3 py-2" />
        <input name="password" type="password" required minLength={12} placeholder="Strong password (12+ characters)" className="border border-card-border px-3 py-2" />
        <select name="role" className="border border-card-border px-3 py-2">
          <option>EDITOR</option>
          <option>VIEWER</option>
          <option>ADMIN</option>
        </select>
        <div className="flex items-center gap-3 md:col-span-2">
          <Button type="submit">CREATE USER</Button>
          <span aria-live="polite" className="font-mono-label text-[9px] text-muted">{status}</span>
        </div>
      </form>
      <div className="space-y-3">
        {users.map((user) => (
          <article key={user.id} className="technical-panel flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="font-display font-semibold">{user.name || "Unnamed user"}</p>
              <p className="text-sm text-muted">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <select value={user.role} onChange={(event) => changeRole(user, event.target.value as AdminUser["role"])} className="border border-card-border px-2 py-1 font-mono-label text-[9px]">
                <option>ADMIN</option><option>EDITOR</option><option>VIEWER</option>
              </select>
              <button onClick={() => deactivate(user)} className="border border-red/30 px-3 py-2 font-mono-label text-[9px] text-red">DEACTIVATE</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
