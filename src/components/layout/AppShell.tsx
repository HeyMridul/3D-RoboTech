"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { SystemLoader } from "@/components/ui/SystemLoader";

export function AppShell({
  children,
  banner,
}: {
  children: React.ReactNode;
  /** Rendered on public pages only; a server component passed down from the layout. */
  banner?: React.ReactNode;
}) {
  const [booted, setBooted] = useState(false);
  const pathname = usePathname();

  // The CMS has its own chrome and should never show the boot sequence.
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:bg-cyan focus:text-charcoal focus:px-4 focus:py-2 focus:font-mono-label focus:text-xs"
      >
        Skip to content
      </a>

      {/*
        The page is always rendered. The boot sequence is a veil painted over
        it, never a gate in front of it — gating children kept the markup out
        of the server response entirely, so crawlers and screen readers saw an
        empty document and LCP waited on an animation.
      */}
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <CommandPalette />
      {banner}

      {!booted && <SystemLoader onComplete={() => setBooted(true)} />}
    </>
  );
}
