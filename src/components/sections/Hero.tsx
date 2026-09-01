"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { SystemStatus } from "@/components/ui/SystemStatus";
import { siteConfig } from "@/config/site";
import { Sep } from "@/components/ui/Sep";

const HeroCanvas = dynamic(
  () => import("@/components/three/HeroCanvas").then((m) => m.HeroCanvas),
  { ssr: false },
);

interface HeroProps {
  stats?: { projects: number; members: number; workshops: number };
}

/**
 * Progress through the hero section, 0 at the top and 1 once it has fully
 * scrolled away. Drives the craft's descent toward its pad.
 */
function useHeroScrollProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const height = el.offsetHeight || 1;
      setProgress(Math.min(1, Math.max(0, window.scrollY / height)));
    };
    const onScroll = () => {
      // Coalesce to one update per frame; scroll fires far more often
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref]);

  return progress;
}

export function Hero({ stats }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollProgress = useHeroScrollProgress(sectionRef);

  const displayStats = {
    projects: stats?.projects ?? 0,
    members: stats?.members ?? 0,
    workshops: stats?.workshops ?? 0,
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className="relative min-h-[100svh] flex items-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <HeroCanvas scrollProgress={scrollProgress} />
        {/*
          Two scrims: one anchors the scene to the page background, one keeps
          the copy legible over whatever the 3D grid is doing behind it.
        */}
        <div className="absolute inset-0 bg-linear-to-b from-background/60 via-transparent to-background" />
        <div className="absolute inset-0 bg-linear-to-r from-background via-background/70 to-transparent lg:to-transparent lg:via-background/40" />
      </div>

      <div className="container-traic relative z-10 pt-32 pb-24">
        <div className="max-w-3xl">
          <p className="font-mono-label text-[11px] text-cyan mb-5">
            TRAIC // ROBOTICS &amp; INNOVATION CLUB
          </p>

          <h1
            id="hero-heading"
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.92] mb-6"
          >
            BUILD BEYOND
            <br />
            <span className="text-cyan text-glow-cyan">LIMITS.</span>
          </h1>

          <p className="font-display text-xl md:text-2xl text-metallic mb-5">
            {siteConfig.tagline}
          </p>

          <p className="border-l-2 border-cyan/50 pl-4 text-muted max-w-xl mb-9 leading-relaxed">
            TRAIC is a community of builders, engineers, developers and
            innovators turning ideas into real-world technology.
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <ButtonLink href="/about" size="lg">
              EXPLORE TRAIC
            </ButtonLink>
            <ButtonLink href="/projects" variant="outline" size="lg">
              VIEW PROJECTS
            </ButtonLink>
          </div>

          <dl className="font-mono-label text-[10px] text-muted grid grid-cols-2 sm:flex sm:flex-wrap gap-x-8 gap-y-2">
            <div className="flex gap-2">
              <dt>SYSTEM STATUS</dt>
              <dd className="text-green">ONLINE</dd>
            </div>
            <div className="flex gap-2">
              <dt>PROJECTS</dt>
              <dd className="text-foreground">{displayStats.projects}+</dd>
            </div>
            <div className="flex gap-2">
              <dt>MEMBERS</dt>
              <dd className="text-foreground">{displayStats.members}+</dd>
            </div>
            <div className="flex gap-2">
              <dt>WORKSHOPS</dt>
              <dd className="text-foreground">{displayStats.workshops}+</dd>
            </div>
            <div className="flex gap-2">
              <dt className="sr-only">Coordinates</dt>
              <dd>
                LAT {siteConfig.location.lat}<Sep />LON {siteConfig.location.lon}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Instrument readout, parked clear of the craft and the copy */}
      <SystemStatus
        items={[...siteConfig.systemStatus]}
        className="hidden xl:block absolute right-10 bottom-16 z-10 w-72"
      />

      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono-label text-[10px] text-muted">SCROLL</span>
          <div className="w-px h-10 bg-linear-to-b from-cyan to-transparent" />
        </div>
      </div>
    </section>
  );
}
