"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { SystemLoader } from "@/components/ui/SystemLoader";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {!loaded && <SystemLoader onComplete={() => setLoaded(true)} />}
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CommandPalette />
    </>
  );
}
