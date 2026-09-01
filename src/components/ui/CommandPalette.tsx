"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { siteConfig } from "@/config/site";
import { Sep } from "@/components/ui/Sep";
import { useIsApplePlatform } from "@/hooks/use-media";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const isMac = useIsApplePlatform();
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  // Where focus was before the palette opened, so it can be handed back.
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
      // The footer promises this; without it the palette can only be
      // dismissed with a mouse.
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  // Move focus in on open, hold it inside, and give it back on close.
  useEffect(() => {
    if (!open) {
      restoreFocusTo.current?.focus?.();
      restoreFocusTo.current = null;
      return;
    }

    restoreFocusTo.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector("input")?.focus();

    // The page behind a modal should not scroll with it.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const navigate = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-label="TRAIC command center"
      ref={dialogRef}
    >
      <div
        className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden="true"
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
            ESC to close
            <Sep />
            {isMac ? "⌘K" : "CTRL K"} to open
          </div>
        </Command>
      </div>
    </div>
  );
}
