import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 font-mono-label whitespace-nowrap transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan",
  {
    variants: {
      variant: {
        primary: "bg-cyan text-charcoal hover:bg-cyan/90 glow-cyan",
        secondary:
          "bg-graphite text-foreground border border-card-border hover:border-cyan/50 hover:text-cyan",
        ghost: "text-muted hover:text-cyan",
        outline:
          "border border-cyan/30 text-cyan hover:bg-cyan/10 hover:border-cyan",
        danger: "border border-red/40 text-red hover:bg-red/10 hover:border-red",
      },
      size: {
        sm: "px-4 py-2 text-[11px]",
        md: "px-6 py-3 text-xs",
        lg: "px-8 py-4 text-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

/** The arrow slides on hover — the only motion primary actions need. */
function Arrow() {
  return (
    <span
      aria-hidden="true"
      className="inline-block transition-transform duration-300 group-hover:translate-x-1"
    >
      →
    </span>
  );
}

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {
  /** Show the sliding arrow. Defaults on for primary actions. */
  withArrow?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, withArrow, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      {(withArrow ?? (variant ?? "primary") === "primary") && <Arrow />}
    </button>
  ),
);

Button.displayName = "Button";

interface ButtonLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
    ButtonVariantProps {
  href: string;
  withArrow?: boolean;
  /** Set for links leaving the site; adds the safe rel and target. */
  external?: boolean;
}

/**
 * Navigation styled as a button. Renders a single anchor so we never nest a
 * <button> inside an <a>, which would produce two tab stops and invalid HTML.
 */
export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  (
    { className, variant, size, children, withArrow, external, href, ...props },
    ref,
  ) => {
    const classes = cn(buttonVariants({ variant, size }), className);
    const showArrow = withArrow ?? (variant ?? "primary") === "primary";
    const content = (
      <>
        {children}
        {showArrow && <Arrow />}
      </>
    );

    if (external) {
      return (
        <a
          ref={ref}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          {...props}
        >
          {content}
        </a>
      );
    }

    return (
      <Link ref={ref} href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  },
);

ButtonLink.displayName = "ButtonLink";
