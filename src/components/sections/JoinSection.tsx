"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button, ButtonLink } from "@/components/ui/Button";

const interestOptions = [
  "Robotics",
  "AI/ML",
  "IoT",
  "Web Development",
  "Drones",
  "Embedded Systems",
  "Computer Vision",
  "Research",
];

export function JoinSection() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const interests = formData.getAll("interests") as string[];
    const skillsRaw = formData.get("skills") as string;

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          year: formData.get("year"),
          branch: formData.get("branch"),
          interests,
          skills: skillsRaw ? skillsRaw.split(",").map((s) => s.trim()) : [],
          githubUrl: formData.get("github") || "",
          linkedinUrl: formData.get("linkedin") || "",
          message: formData.get("message"),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <section id="join" className="section-padding">
      <div className="container-traic">
        <SectionHeader
          label="RECRUITMENT"
          title="Have an Idea?"
          description="Don't just think it. Build it. Join TRAIC and turn your ideas into real technology."
          align="center"
        />

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <ButtonLink href="/join#apply" size="lg">
            JOIN TRAIC
          </ButtonLink>
          {/* Project proposals go through contact — there is no separate
              intake form, and #propose previously pointed at nothing. */}
          <ButtonLink href="/contact" variant="outline" size="lg">
            PROPOSE A PROJECT
          </ButtonLink>
          <ButtonLink href="/workshops" variant="secondary" size="lg">
            ATTEND A WORKSHOP
          </ButtonLink>
        </div>

        <form
          id="apply"
          onSubmit={handleSubmit}
          aria-labelledby="apply-heading"
          className="max-w-2xl mx-auto border border-card-border bg-card p-8 space-y-6 scroll-mt-28"
        >
          <p id="apply-heading" className="font-mono-label text-cyan">
            APPLICATION FORM
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="font-mono-label text-[10px] text-muted">NAME</span>
              <input
                name="name"
                required
                className="mt-1 w-full bg-graphite border border-card-border px-4 py-3 text-sm focus:border-cyan outline-none"
              />
            </label>
            <label className="block">
              <span className="font-mono-label text-[10px] text-muted">EMAIL</span>
              <input
                name="email"
                type="email"
                required
                className="mt-1 w-full bg-graphite border border-card-border px-4 py-3 text-sm focus:border-cyan outline-none"
              />
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="font-mono-label text-[10px] text-muted">YEAR</span>
              <input
                name="year"
                required
                placeholder="e.g. 2nd Year"
                className="mt-1 w-full bg-graphite border border-card-border px-4 py-3 text-sm focus:border-cyan outline-none"
              />
            </label>
            <label className="block">
              <span className="font-mono-label text-[10px] text-muted">BRANCH</span>
              <input
                name="branch"
                required
                placeholder="e.g. CSE"
                className="mt-1 w-full bg-graphite border border-card-border px-4 py-3 text-sm focus:border-cyan outline-none"
              />
            </label>
          </div>

          <fieldset>
            <legend className="font-mono-label text-[10px] text-muted mb-2">
              INTERESTS
            </legend>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => (
                <label
                  key={interest}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name="interests"
                    value={interest}
                    className="accent-cyan"
                  />
                  <span className="text-sm text-muted">{interest}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="font-mono-label text-[10px] text-muted">
              SKILLS (comma separated)
            </span>
            <input
              name="skills"
              placeholder="Python, React, Arduino..."
              className="mt-1 w-full bg-graphite border border-card-border px-4 py-3 text-sm focus:border-cyan outline-none"
            />
          </label>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="font-mono-label text-[10px] text-muted">GITHUB</span>
              <input
                name="github"
                type="url"
                className="mt-1 w-full bg-graphite border border-card-border px-4 py-3 text-sm focus:border-cyan outline-none"
              />
            </label>
            <label className="block">
              <span className="font-mono-label text-[10px] text-muted">LINKEDIN</span>
              <input
                name="linkedin"
                type="url"
                className="mt-1 w-full bg-graphite border border-card-border px-4 py-3 text-sm focus:border-cyan outline-none"
              />
            </label>
          </div>

          <label className="block">
            <span className="font-mono-label text-[10px] text-muted">
              WHY DO YOU WANT TO JOIN TRAIC?
            </span>
            <textarea
              name="message"
              required
              rows={4}
              className="mt-1 w-full bg-graphite border border-card-border px-4 py-3 text-sm focus:border-cyan outline-none resize-none"
            />
          </label>

          {status === "success" && (
            <p className="font-mono-label text-green text-sm">
              APPLICATION RECEIVED. WE&apos;LL BE IN TOUCH.
            </p>
          )}
          {status === "error" && (
            <p className="font-mono-label text-red text-sm">{error}</p>
          )}

          <Button type="submit" disabled={status === "loading"} className="w-full">
            {status === "loading" ? "TRANSMITTING..." : "SUBMIT APPLICATION"}
          </Button>
        </form>
      </div>
    </section>
  );
}
