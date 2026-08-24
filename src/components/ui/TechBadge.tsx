import { cn } from "@/lib/utils";

interface TechBadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "cyan" | "green";
}

export function TechBadge({
  children,
  className,
  variant = "default",
}: TechBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 font-mono-label text-[10px] border",
        {
          "border-card-border text-muted bg-graphite/50": variant === "default",
          "border-cyan/30 text-cyan bg-cyan/5": variant === "cyan",
          "border-green/30 text-green bg-green/5": variant === "green",
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
