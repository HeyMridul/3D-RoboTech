"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { SystemLoader } from "@/components/ui/SystemLoader";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { DemoBanner } from "@/components/ui/DemoBanner";

export function AppShell({
  children,
  demoMode = false,
}: {
  children: React.ReactNode;
  demoMode?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <a href="#main" className="skip-link">
        SKIP TO CONTENT
      </a>
      <CustomCursor />
      {!loaded && <SystemLoader onComplete={() => setLoaded(true)} />}
      {demoMode && <DemoBanner />}
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <CommandPalette />
    </>
  );
}
