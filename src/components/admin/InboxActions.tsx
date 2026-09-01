"use client";

import { useRouter } from "next/navigation";

export function ApplicationActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  async function setStatus(nextStatus: string) {
    const response = await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (response.ok) router.refresh();
  }
  return (
    <select
      aria-label="Application status"
      value={status}
      onChange={(event) => setStatus(event.target.value)}
      className="border border-card-border px-2 py-1 font-mono-label text-[9px]"
    >
      {["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"].map((value) => (
        <option key={value}>{value}</option>
      ))}
    </select>
  );
}

export function MessageActions({ id, read }: { id: string; read: boolean }) {
  const router = useRouter();
  async function toggleRead() {
    const response = await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !read }),
    });
    if (response.ok) router.refresh();
  }
  return (
    <button
      type="button"
      onClick={toggleRead}
      className="border border-card-border px-3 py-2 font-mono-label text-[9px] text-cyan"
    >
      MARK {read ? "UNREAD" : "READ"}
    </button>
  );
}
