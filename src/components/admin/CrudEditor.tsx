"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { AdminField, ResourceConfig } from "@/config/admin";

interface CrudEditorProps {
  config: ResourceConfig;
  initial?: Record<string, unknown>;
  id?: string;
}

function toInputValue(field: AdminField, value: unknown) {
  if (value == null) return field.type === "checkbox" ? false : "";
  if (field.type === "date") {
    const d = new Date(String(value));
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 16);
  }
  if (field.type === "tags") {
    return Array.isArray(value) ? value.join(", ") : String(value);
  }
  if (field.type === "checkbox") return Boolean(value);
  return String(value);
}

export function CrudEditor({ config, initial, id }: CrudEditorProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState<Record<string, unknown>>(() => {
    const next: Record<string, unknown> = {};
    for (const field of config.fields) {
      next[field.name] = toInputValue(field, initial?.[field.name]);
    }
    return next;
  });

  function setField(name: string, value: unknown) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError("");

    const payload: Record<string, unknown> = {};
    for (const field of config.fields) {
      const value = form[field.name];
      if (field.type === "number") {
        payload[field.name] =
          value === "" || value == null ? null : Number(value);
      } else if (field.type === "checkbox") {
        payload[field.name] = Boolean(value);
      } else if (field.type === "tags") {
        payload[field.name] = String(value || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (field.type === "date") {
        payload[field.name] = value ? new Date(String(value)).toISOString() : null;
      } else if (value === "") {
        payload[field.name] = field.required ? value : "";
      } else {
        payload[field.name] = value;
      }
    }

    const url = id
      ? `/api/admin/${config.key}/${id}`
      : `/api/admin/${config.key}`;
    const res = await fetch(url, {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus("error");
      setError(data.error || "Save failed");
      return;
    }

    router.push(config.listHref);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8 max-w-3xl space-y-5">
      <div>
        <p className="font-mono-label text-cyan mb-1">CMS</p>
        <h1 className="font-display text-2xl font-bold">
          {id ? `Edit ${config.singular}` : `New ${config.singular}`}
        </h1>
      </div>

      {config.fields.map((field) => (
        <label key={field.name} className="block">
          <span className="font-mono-label text-[10px] text-muted">
            {field.label}
          </span>
          {field.type === "textarea" ? (
            <textarea
              required={field.required}
              rows={5}
              value={String(form[field.name] ?? "")}
              onChange={(e) => setField(field.name, e.target.value)}
              className="mt-1 w-full bg-graphite border border-card-border px-4 py-3 text-sm focus:border-cyan outline-none resize-y"
            />
          ) : field.type === "select" ? (
            <select
              required={field.required}
              value={String(form[field.name] ?? "")}
              onChange={(e) => setField(field.name, e.target.value)}
              className="mt-1 w-full bg-graphite border border-card-border px-4 py-3 text-sm focus:border-cyan outline-none"
            >
              <option value="">Select</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : field.type === "checkbox" ? (
            <input
              type="checkbox"
              checked={Boolean(form[field.name])}
              onChange={(e) => setField(field.name, e.target.checked)}
              className="mt-2 block accent-cyan"
            />
          ) : (
            <input
              type={
                field.type === "number"
                  ? "number"
                  : field.type === "email"
                    ? "email"
                    : field.type === "date"
                      ? "datetime-local"
                      : field.type === "url"
                        ? "url"
                        : "text"
              }
              required={field.required}
              value={String(form[field.name] ?? "")}
              onChange={(e) => setField(field.name, e.target.value)}
              className="mt-1 w-full bg-graphite border border-card-border px-4 py-3 text-sm focus:border-cyan outline-none"
            />
          )}
        </label>
      ))}

      {status === "error" && (
        <p className="font-mono-label text-red text-sm">{error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={status === "saving"}>
          {status === "saving" ? "SAVING..." : "SAVE"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(config.listHref)}
        >
          CANCEL
        </Button>
      </div>
    </form>
  );
}
