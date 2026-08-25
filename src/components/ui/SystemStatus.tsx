"use client";

import { cn } from "@/lib/utils";

interface SystemStatusProps {
  items: { label: string; status: string }[];
  className?: string;
}

export function SystemStatus({ items, className }: SystemStatusProps) {
  return (
    <div
      className={cn(
        "border border-card-border bg-card/80 backdrop-blur-sm p-4 font-mono-label text-[11px]",
        className,
      )}
    >
      <p className="text-cyan mb-3">TRAIC LAB SYSTEM</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center justify-between gap-4">
            <span className="text-muted flex items-center gap-2">
              <span
                className={cn(
                  "inline-block w-1.5 h-1.5 rounded-full",
                  item.status === "ONLINE" || item.status === "ACTIVE"
                    ? "bg-green shadow-[0_0_6px_var(--green)]"
                    : "bg-orange",
                )}
              />
              {item.label}
            </span>
            <span className="text-foreground">{item.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
