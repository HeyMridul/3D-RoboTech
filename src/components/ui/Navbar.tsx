"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-charcoal/90 backdrop-blur-md border-b border-card-border"
          : "bg-transparent",
      )}
    >
      <nav className="container-traic flex items-center justify-between h-16 md:h-20 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="w-8 h-8 border border-cyan/50 flex items-center justify-center group-hover:border-cyan transition-colors">
            <span className="font-mono-label text-cyan text-[10px]">T</span>
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-wider">
              TRAIC
            </span>
            <span className="hidden sm:block font-mono-label text-[9px] text-muted">
              ROBOTICS & INNOVATION
            </span>
          </div>
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {siteConfig.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="font-mono-label text-[11px] text-muted hover:text-cyan transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/projects"
            className="font-mono-label text-[11px] text-muted hover:text-foreground transition-colors"
          >
            PROJECTS
          </Link>
          <Link
            href="/join"
            className="font-mono-label text-[11px] px-4 py-2 border border-cyan/40 text-cyan hover:bg-cyan/10 transition-all"
          >
            JOIN →
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden p-2 text-muted hover:text-cyan"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden bg-charcoal/95 border-b border-card-border px-4 py-6">
          <ul className="space-y-4">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block font-mono-label text-sm text-muted hover:text-cyan"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
