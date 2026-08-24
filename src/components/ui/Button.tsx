import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group inline-flex items-center justify-center gap-2 font-mono-label transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-cyan text-charcoal hover:bg-cyan/90 glow-cyan": variant === "primary",
            "bg-graphite text-foreground border border-card-border hover:border-cyan/50":
              variant === "secondary",
            "text-muted hover:text-cyan": variant === "ghost",
            "border border-cyan/30 text-cyan hover:bg-cyan/10 hover:border-cyan":
              variant === "outline",
          },
          {
            "px-4 py-2 text-xs": size === "sm",
            "px-6 py-3 text-xs": size === "md",
            "px-8 py-4 text-sm": size === "lg",
          },
          className,
        )}
        {...props}
      >
        {children}
        {variant === "primary" && (
          <span className="inline-block transition-transform group-hover:translate-x-1">
            →
          </span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
