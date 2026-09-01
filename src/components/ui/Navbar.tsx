"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { useScrollY } from "@/hooks/use-media";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const scrolled = useScrollY() > 50;

  /*
   * A route change should never leave the mobile sheet hanging open. Adjusted
   * during render rather than in an effect, which would paint the open menu
   * on the new page first and then close it.
   */
  const [renderedPath, setRenderedPath] = useState(pathname);
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    setMobileOpen(false);
  }

  // Escape closes the sheet, matching the command palette's behaviour.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
        scrolled || mobileOpen
          ? "bg-charcoal/90 backdrop-blur-md border-b border-card-border"
          : "bg-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className="container-traic flex items-center justify-between h-16 md:h-20"
      >
        <Link href="/" className="group flex items-center gap-3">
          <span className="w-8 h-8 border border-cyan/50 flex items-center justify-center group-hover:border-cyan transition-colors shrink-0">
            <span className="font-mono-label text-cyan text-[10px]">T</span>
          </span>
          <span>
            <span className="block font-display font-bold text-lg tracking-wider leading-none">
              TRAIC
            </span>
            <span className="hidden sm:block font-mono-label text-[9px] text-muted mt-0.5">
              ROBOTICS &amp; INNOVATION
            </span>
          </span>
        </Link>

        <ul className="hidden lg:flex items-center gap-8">
          {siteConfig.nav.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative font-mono-label text-[11px] transition-colors py-1",
                    active ? "text-cyan" : "text-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                  {/* Section indicator, not decoration: it marks where you are */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -bottom-1 left-0 h-px bg-cyan transition-all duration-300",
                      active ? "w-full" : "w-0",
                    )}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/join"
            className="font-mono-label text-[11px] px-4 py-2 border border-cyan/40 text-cyan hover:bg-cyan/10 transition-colors"
          >
            JOIN →
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden p-2 -mr-2 text-muted hover:text-cyan"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {mobileOpen && (
        <div
          id="mobile-nav"
          className="lg:hidden bg-charcoal/95 backdrop-blur-md border-b border-card-border"
        >
          <ul className="container-traic py-4">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "block font-mono-label text-sm py-3 border-b border-card-border/50",
                    isActive(item.href)
                      ? "text-cyan"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-4">
              <Link
                href="/join"
                className="block text-center font-mono-label text-sm px-4 py-3 border border-cyan/40 text-cyan"
              >
                JOIN TRAIC →
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
