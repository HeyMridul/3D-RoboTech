import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  label,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-12 md:mb-16",
        align === "center" && "text-center mx-auto max-w-3xl",
        className,
      )}
    >
      {label && (
        <p className="font-mono-label text-cyan mb-3">{label}</p>
      )}
      <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-muted text-lg leading-relaxed">{description}</p>
      )}
      <div
        className={cn(
          "mt-6 h-px w-24 bg-gradient-to-r from-cyan to-transparent",
          align === "center" && "mx-auto",
        )}
      />
    </div>
  );
}
