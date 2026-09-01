"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const APPLICATION_STATUSES = [
  "PENDING",
  "REVIEWING",
  "ACCEPTED",
  "REJECTED",
] as const;

const STATUS_STYLES: Record<string, string> = {
  PENDING: "text-muted border-card-border",
  REVIEWING: "text-cyan border-cyan/40",
  ACCEPTED: "text-green border-green/40",
  REJECTED: "text-red border-red/40",
};

function useMutate(endpoint: string) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(init: RequestInit) {
    setBusy(true);
    setError(null);
    const res = await fetch(endpoint, init);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Action failed.");
    } else {
      router.refresh();
    }
    setBusy(false);
  }

  return { busy, error, send };
}

export function ApplicationActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const { busy, error, send } = useMutate(`/api/admin/applications/${id}`);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="sr-only">Set application status</span>
      {APPLICATION_STATUSES.map((option) => (
        <button
          key={option}
          type="button"
          disabled={busy || option === status}
          aria-pressed={option === status}
          onClick={() =>
            send({
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ status: option }),
            })
          }
          className={cn(
            "font-mono-label text-[9px] px-2 py-1 border transition-colors disabled:cursor-default",
            option === status
              ? STATUS_STYLES[option]
              : "border-card-border text-muted hover:text-foreground hover:border-metallic",
          )}
        >
          {option}
        </button>
      ))}
      {error && (
        <span role="alert" className="text-[10px] text-red">
          {error}
        </span>
      )}
    </div>
  );
}

export function MessageActions({ id, read }: { id: string; read: boolean }) {
  const { busy, error, send } = useMutate(`/api/admin/messages/${id}`);

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={busy}
        onClick={() =>
          send({
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ read: !read }),
          })
        }
        className="font-mono-label text-[10px] text-muted hover:text-cyan disabled:opacity-50"
      >
        {read ? "MARK UNREAD" : "MARK READ"}
      </button>
      {error && (
        <span role="alert" className="text-[10px] text-red">
          {error}
        </span>
      )}
    </div>
  );
}
