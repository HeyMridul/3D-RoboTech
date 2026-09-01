"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface GalleryClientProps {
  items: { id: string; title: string | null; imageUrl: string; caption: string | null }[];
}

export function GalleryClient({ items }: GalleryClientProps) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: url, title }),
    });
    if (!res.ok) {
      setStatus("Failed to add item");
      return;
    }
    setUrl("");
    setTitle("");
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="p-6 md:p-8">
      <p className="font-mono-label text-cyan mb-1">CMS</p>
      <h1 className="font-display text-2xl font-bold mb-8">Gallery</h1>

      <form onSubmit={addItem} className="border border-card-border bg-card p-6 mb-8 grid md:grid-cols-3 gap-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="bg-graphite border border-card-border px-4 py-3 text-sm focus:border-cyan outline-none"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Image URL"
          required
          className="bg-graphite border border-card-border px-4 py-3 text-sm focus:border-cyan outline-none"
        />
        <Button type="submit">ADD IMAGE</Button>
      </form>
      {status && <p className="font-mono-label text-red text-sm mb-4">{status}</p>}

      {items.length === 0 ? (
        <p className="font-mono-label text-muted">NO GALLERY ITEMS</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="border border-card-border bg-card">
              <div
                className="aspect-video bg-graphite bg-cover bg-center"
                style={{ backgroundImage: `url(${item.imageUrl})` }}
              />
              <div className="p-3 flex justify-between items-center">
                <p className="text-sm truncate">{item.title || "Untitled"}</p>
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
