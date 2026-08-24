"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { siteConfig } from "@/config/site";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  const navigate = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg px-4">
        <Command
          className="border border-card-border bg-card shadow-2xl overflow-hidden"
          label="TRAIC Command Center"
        >
          <div className="border-b border-card-border px-4 py-3">
            <p className="font-mono-label text-cyan text-[10px] mb-2">
              TRAIC COMMAND CENTER
            </p>
            <Command.Input
              placeholder="Search commands..."
              className="w-full bg-transparent text-foreground placeholder:text-muted outline-none text-sm"
            />
          </div>
          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="p-4 text-sm text-muted text-center">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigate" className="[&_[cmdk-group-heading]]:font-mono-label [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:text-muted [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1">
              {siteConfig.nav.map((item) => (
                <Command.Item
                  key={item.href}
                  onSelect={() => navigate(item.href)}
                  className="px-3 py-2 text-sm text-muted hover:bg-cyan/10 hover:text-cyan cursor-pointer rounded data-[selected=true]:bg-cyan/10 data-[selected=true]:text-cyan"
                >
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Quick Actions" className="[&_[cmdk-group-heading]]:font-mono-label [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:text-muted [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1">
              <Command.Item
                onSelect={() => navigate("/projects")}
                className="px-3 py-2 text-sm text-muted hover:bg-cyan/10 hover:text-cyan cursor-pointer rounded data-[selected=true]:bg-cyan/10"
              >
                Search Projects
              </Command.Item>
              <Command.Item
                onSelect={() => navigate("/members")}
                className="px-3 py-2 text-sm text-muted hover:bg-cyan/10 hover:text-cyan cursor-pointer rounded data-[selected=true]:bg-cyan/10"
              >
                Search Members
              </Command.Item>
              <Command.Item
                onSelect={() => navigate("/workshops")}
                className="px-3 py-2 text-sm text-muted hover:bg-cyan/10 hover:text-cyan cursor-pointer rounded data-[selected=true]:bg-cyan/10"
              >
                Explore Workshops
              </Command.Item>
              <Command.Item
                onSelect={() => navigate("/achievements")}
                className="px-3 py-2 text-sm text-muted hover:bg-cyan/10 hover:text-cyan cursor-pointer rounded data-[selected=true]:bg-cyan/10"
              >
                View Achievements
              </Command.Item>
              <Command.Item
                onSelect={() => navigate("/join")}
                className="px-3 py-2 text-sm text-muted hover:bg-cyan/10 hover:text-cyan cursor-pointer rounded data-[selected=true]:bg-cyan/10"
              >
                Join TRAIC
              </Command.Item>
            </Command.Group>
          </Command.List>
          <div className="border-t border-card-border px-4 py-2 font-mono-label text-[9px] text-muted">
            ESC to close // ⌘K to open
          </div>
        </Command>
      </div>
    </div>
  );
}
