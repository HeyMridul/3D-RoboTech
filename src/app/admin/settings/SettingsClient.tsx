"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface SettingsClientProps {
  settings: { id: string; key: string; value: string }[];
}

export function SettingsClient({ settings }: SettingsClientProps) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    setKey("");
    setValue("");
    router.refresh();
  }

  async function update(id: string, next: string) {
    await fetch(`/api/admin/settings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: next }),
    });
    router.refresh();
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <p className="font-mono-label text-cyan mb-1">CMS</p>
      <h1 className="font-display text-2xl font-bold mb-8">Settings</h1>

      <form onSubmit={save} className="border border-card-border bg-card p-6 mb-8 space-y-4">
        <p className="font-mono-label text-cyan">ADD / UPSERT KEY</p>
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          required
          placeholder="key"
          className="w-full bg-graphite border border-card-border px-4 py-3 text-sm focus:border-cyan outline-none"
        />
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          rows={3}
          placeholder="value"
          className="w-full bg-graphite border border-card-border px-4 py-3 text-sm focus:border-cyan outline-none"
        />
        <Button type="submit">SAVE SETTING</Button>
      </form>

      <div className="space-y-4">
        {settings.map((s) => (
          <div key={s.id} className="border border-card-border bg-card p-4">
            <p className="font-mono-label text-[10px] text-cyan mb-2">{s.key}</p>
            <textarea
              defaultValue={s.value}
              rows={2}
              className="w-full bg-graphite border border-card-border px-3 py-2 text-sm focus:border-cyan outline-none"
              onBlur={(e) => {
                if (e.target.value !== s.value) update(s.id, e.target.value);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
