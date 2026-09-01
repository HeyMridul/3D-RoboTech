"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function MediaLibrary({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function upload(files: FileList) {
    setBusy(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error ?? `Failed to upload ${file.name}.`);
        }
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setError("Could not copy to the clipboard.");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="font-mono-label text-[11px] px-4 py-2 border border-cyan text-cyan hover:bg-cyan/10 disabled:opacity-50"
        >
          {busy ? "UPLOADING…" : "+ UPLOAD FILES"}
        </button>
        <p className="font-mono-label text-[10px] text-muted">
          {items.length} FILES // MAX 8MB EACH
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.glb,.gltf"
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) upload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 border border-red/40 bg-red/5 px-4 py-3 font-mono-label text-[11px] text-red"
        >
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="border border-dashed border-card-border p-12 text-center">
          <p className="font-mono-label text-[11px] text-muted mb-2">
            MEDIA LIBRARY EMPTY
          </p>
          <p className="text-sm text-muted">
            Upload an image or a .glb model to get started.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => {
            const isImage = item.mimeType.startsWith("image/");
            return (
              <li
                key={item.id}
                className="border border-card-border bg-card overflow-hidden"
              >
                <div className="aspect-video bg-charcoal flex items-center justify-center overflow-hidden">
                  {isImage ? (
                    // Operator-supplied paths; next/image would need host config.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="font-mono-label text-[10px] text-cyan">
                      3D MODEL
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs truncate" title={item.filename}>
                    {item.filename}
                  </p>
                  <p className="font-mono-label text-[9px] text-muted mt-1">
                    {formatBytes(item.size)} // {formatDate(item.createdAt)}
                  </p>
                  <button
                    type="button"
                    onClick={() => copy(item.url)}
                    className="mt-2 font-mono-label text-[9px] text-cyan hover:underline"
                  >
                    {copied === item.url ? "COPIED" : "COPY URL"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
