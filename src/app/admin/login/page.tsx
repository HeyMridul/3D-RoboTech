"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: fd.get("email") as string,
      password: fd.get("password") as string,
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError("Invalid credentials");
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center section-padding bg-charcoal">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md border border-card-border bg-card p-8 space-y-6"
      >
        <div className="text-center">
          <p className="font-mono-label text-cyan mb-2">TRAIC ADMIN</p>
          <h1 className="font-display text-2xl font-bold">System Access</h1>
        </div>

        <label className="block">
          <span className="font-mono-label text-[10px] text-muted">EMAIL</span>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full bg-graphite border border-card-border px-4 py-3 text-sm focus:border-cyan outline-none"
          />
        </label>

        <label className="block">
          <span className="font-mono-label text-[10px] text-muted">PASSWORD</span>
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full bg-graphite border border-card-border px-4 py-3 text-sm focus:border-cyan outline-none"
          />
        </label>

        {error && (
          <p className="font-mono-label text-red text-sm text-center">{error}</p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "AUTHENTICATING..." : "ACCESS SYSTEM"}
        </Button>
      </form>
    </div>
  );
}
