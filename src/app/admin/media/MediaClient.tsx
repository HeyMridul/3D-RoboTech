"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface MediaClientProps {
  items: { id: string; filename: string; url: string; mimeType: string; size: number }[];
}

export function MediaClient({ items }: MediaClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState("");

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus(data.error || "Upload failed");
      return;
    }
    setStatus("Uploaded");
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="p-6 md:p-8">
      <p className="font-mono-label text-cyan mb-1">CMS</p>
      <h1 className="font-display text-2xl font-bold mb-8">Media</h1>

      <label className="block border border-dashed border-card-border p-8 text-center mb-8 cursor-pointer hover:border-cyan/40">
        <p className="font-mono-label text-muted mb-2">UPLOAD IMAGE / GLB</p>
        <p className="text-xs text-muted">Max 5MB. JPEG, PNG, WebP, GIF, GLB.</p>
        <input type="file" className="hidden" onChange={upload} />
      </label>
      {status && <p className="font-mono-label text-cyan text-sm mb-4">{status}</p>}

      {items.length === 0 ? (
        <p className="font-mono-label text-muted">NO MEDIA FILES</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border border-card-border bg-card p-4"
            >
              <div>
                <p className="text-sm">{item.filename}</p>
                <p className="font-mono-label text-[10px] text-muted">
                  {item.mimeType} {"//"} {Math.round(item.size / 1024)} KB {"//"} {item.url}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(item.url)}
                  className="font-mono-label text-[10px] text-cyan"
                >
                  COPY URL
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="font-mono-label text-[10px] text-red"
                >
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
