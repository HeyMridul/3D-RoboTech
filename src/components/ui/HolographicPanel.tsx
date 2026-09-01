import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface HolographicPanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function HolographicPanel({
  title,
  children,
  className,
}: HolographicPanelProps) {
  return (
    <div
      className={cn(
        "relative border border-cyan/25 bg-card/70 backdrop-blur-md p-5",
        className,
      )}
    >
      <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan" />
      <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan" />
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan" />
      {title && <p className="font-mono-label text-cyan mb-3">{title}</p>}
      {children}
    </div>
  );
}
