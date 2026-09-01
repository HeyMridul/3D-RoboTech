"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { Sep } from "@/components/ui/Sep";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          subject: fd.get("subject"),
          message: fd.get("message"),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="pt-24 section-padding min-h-screen">
      <div className="container-traic">
        <SectionHeader
          label="COMMUNICATIONS"
          title="Contact"
          description="Reach out to TRAIC for collaborations, questions, or inquiries."
          align="center"
        />

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="space-y-6">
            <div className="border border-card-border bg-card p-6 font-mono-label text-[11px] space-y-3">
              <p className="text-cyan">CONTACT INFO</p>
              <p>
                <span className="text-muted">EMAIL:</span>{" "}
                {siteConfig.contact.email}
              </p>
              <p>
                <span className="text-muted">LOCATION:</span>{" "}
                {siteConfig.location.name}
              </p>
              <p>
                <span className="text-muted">COORDS:</span> LAT{" "}
                {siteConfig.location.lat}<Sep />LON {siteConfig.location.lon}
              </p>
            </div>

            <div className="border border-card-border bg-card p-6">
              <p className="font-mono-label text-cyan mb-4">SOCIAL</p>
              <ul className="space-y-2">
                {Object.entries(siteConfig.social).map(([k, url]) => (
                  <li key={k}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted hover:text-cyan capitalize text-sm transition-colors"
                    >
                      {k}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border border-card-border bg-card p-8 space-y-4"
          >
            <p className="font-mono-label text-cyan">SEND MESSAGE</p>
            <label className="block">
              <span className="font-mono-label text-[10px] text-muted">NAME</span>
              <input name="name" required className="mt-1 w-full bg-graphite border border-card-border px-4 py-3 text-sm focus:border-cyan outline-none" />
            </label>
            <label className="block">
              <span className="font-mono-label text-[10px] text-muted">EMAIL</span>
              <input name="email" type="email" required className="mt-1 w-full bg-graphite border border-card-border px-4 py-3 text-sm focus:border-cyan outline-none" />
            </label>
            <label className="block">
              <span className="font-mono-label text-[10px] text-muted">SUBJECT</span>
              <input name="subject" className="mt-1 w-full bg-graphite border border-card-border px-4 py-3 text-sm focus:border-cyan outline-none" />
            </label>
            <label className="block">
              <span className="font-mono-label text-[10px] text-muted">MESSAGE</span>
              <textarea name="message" required rows={5} className="mt-1 w-full bg-graphite border border-card-border px-4 py-3 text-sm focus:border-cyan outline-none resize-none" />
            </label>
            {status === "success" && (
              <p className="font-mono-label text-green text-sm">MESSAGE TRANSMITTED.</p>
            )}
            {status === "error" && (
              <p className="font-mono-label text-red text-sm">TRANSMISSION FAILED.</p>
            )}
            <Button type="submit" disabled={status === "loading"} className="w-full">
              {status === "loading" ? "SENDING..." : "SEND MESSAGE"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
