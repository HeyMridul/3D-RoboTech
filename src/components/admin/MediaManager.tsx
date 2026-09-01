"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type MediaItem = {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
};

export function MediaManager({ initialItems }: { initialItems: MediaItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [status, setStatus] = useState("");

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("UPLOADING...");
    const form = event.currentTarget;
    const response = await fetch("/api/admin/media", {
      method: "POST",
      body: new FormData(form),
    });
    const body = await response.json();
    if (!response.ok) {
      setStatus(body.error || "UPLOAD FAILED");
      return;
    }
    setItems((current) => [body, ...current]);
    setStatus("UPLOAD COMPLETE");
    form.reset();
  }

  async function remove(item: MediaItem) {
    if (!window.confirm(`Delete ${item.filename}?`)) return;
    const response = await fetch(`/api/admin/media/${item.id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    }
  }

  return (
    <div>
      <p className="font-mono-label text-cyan">ASSET STORAGE</p>
      <h1 className="font-display mb-8 text-3xl font-bold">Media</h1>
      <form onSubmit={upload} className="technical-panel mb-8 flex flex-wrap items-end gap-4 p-5">
        <label className="grow">
          <span className="font-mono-label text-[10px] text-muted">
            IMAGE OR GLB · MAX 5 MB
          </span>
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,.glb"
            required
            className="mt-2 block w-full border border-card-border p-3 text-sm"
          />
        </label>
        <Button type="submit">UPLOAD ASSET</Button>
        <span aria-live="polite" className="font-mono-label text-[9px] text-muted">
          {status}
        </span>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="technical-panel p-4">
            <p className="truncate font-display font-semibold">{item.filename}</p>
            <p className="font-mono-label mt-2 text-[9px] text-muted">
              {item.mimeType} · {(item.size / 1024).toFixed(1)} KB
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(item.url)}
                className="border border-card-border px-3 py-2 font-mono-label text-[9px] text-cyan"
              >
                COPY URL
              </button>
              <button
                type="button"
                onClick={() => remove(item)}
                className="border border-red/30 px-3 py-2 font-mono-label text-[9px] text-red"
              >
                DELETE
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
