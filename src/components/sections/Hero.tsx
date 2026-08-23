"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { SystemStatus } from "@/components/ui/SystemStatus";
import { siteConfig } from "@/config/site";

const HeroCanvas = dynamic(
  () => import("@/components/three/HeroCanvas").then((m) => m.HeroCanvas),
  { ssr: false },
);

interface HeroProps {
  stats?: { projects: number; members: number; workshops: number };
}

export function Hero({ stats }: HeroProps) {
  const displayStats = {
    projects: stats?.projects ?? 0,
    members: stats?.members ?? 0,
    workshops: stats?.workshops ?? 0,
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <HeroCanvas />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-transparent to-background" />
      </div>

      <div className="container-traic relative z-10 section-padding pt-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-mono-label text-cyan mb-4">
              TRAIC // ROBOTICS & INNOVATION CLUB
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none mb-6">
              BUILD BEYOND
              <br />
              <span className="text-cyan text-glow-cyan">LIMITS.</span>
            </h1>
            <p className="font-display text-xl md:text-2xl text-muted mb-4">
              {siteConfig.tagline}
            </p>
            <blockquote className="border-l-2 border-cyan/50 pl-4 text-muted max-w-lg mb-8">
              TRAIC is a community of builders, engineers, developers and
              innovators turning ideas into real-world technology.
            </blockquote>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="/about">
                <Button size="lg">EXPLORE TRAIC</Button>
              </Link>
              <Link href="/projects">
                <Button variant="outline" size="lg">
                  VIEW PROJECTS
                </Button>
              </Link>
            </div>

            <div className="font-mono-label text-[10px] text-muted space-y-1">
              <p>SYSTEM STATUS: ONLINE</p>
              <p>PROJECTS: {displayStats.projects}+</p>
              <p>MEMBERS: {displayStats.members}+</p>
              <p>WORKSHOPS: {displayStats.workshops}+</p>
              <p>
                LAT {siteConfig.location.lat} // LON {siteConfig.location.lon}
              </p>
            </div>
          </div>

          <div className="hidden lg:block">
            <SystemStatus items={[...siteConfig.systemStatus]} />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="font-mono-label text-[10px] text-muted">SCROLL</span>
          <div className="w-px h-8 bg-gradient-to-b from-cyan to-transparent" />
        </div>
      </div>
    </section>
  );
}
