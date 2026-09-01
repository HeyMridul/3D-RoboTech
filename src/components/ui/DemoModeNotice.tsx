"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function DemoModeNotice() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-2rem)] flex items-center gap-3 border border-orange/40 bg-charcoal/95 backdrop-blur-sm px-4 py-2 shadow-lg"
    >
      <span
        className="w-1.5 h-1.5 rounded-full bg-orange shrink-0"
        aria-hidden="true"
      />
      <p className="font-mono-label text-[9px] text-orange">
        DEMO CONTENT
        <span className="text-muted normal-case tracking-normal font-sans ml-2">
          Projects, members and achievements shown here are placeholders, not
          TRAIC&apos;s real record.
        </span>
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 text-muted hover:text-foreground"
      >
        <span className="sr-only">Dismiss demo content notice</span>
        <X size={14} />
      </button>
    </div>
  );
}
