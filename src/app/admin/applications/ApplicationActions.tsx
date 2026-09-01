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

  async function setStatus(next: string) {
    await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => setStatus(s)}
          className={`font-mono-label text-[9px] px-2 py-1 border ${
            status === s
              ? "border-cyan text-cyan"
              : "border-card-border text-muted hover:border-cyan/40"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
