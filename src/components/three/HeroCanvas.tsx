"use client";

import dynamic from "next/dynamic";
import { useIsMobile, useMounted, useMousePosition } from "@/hooks/use-media";

const SceneCanvas = dynamic(
  () => import("./SceneCanvas").then((m) => m.SceneCanvas),
  { ssr: false, loading: () => <SceneLoader /> },
);

const HeroScene = dynamic(() => import("./HeroScene").then((m) => m.HeroScene), {
  ssr: false,
});

function SceneLoader() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-charcoal/50"
      aria-hidden="true"
    >
      <p className="font-mono-label text-[11px] text-cyan animate-pulse">
        LOADING ROBOTICS CORE...
      </p>
    </div>
  );
}

interface HeroCanvasProps {
  scrollProgress?: number;
}

export function HeroCanvas({ scrollProgress = 0 }: HeroCanvasProps) {
  const mouse = useMousePosition();
  const mounted = useMounted();
  const isMobile = useIsMobile();

  if (!mounted) return <SceneLoader />;

  /*
   * Two framings rather than one scaled down. On desktop the camera sits left
   * so the craft lands in the empty right half beside the copy. On a phone
   * there is no empty half, so it centres and pulls back, seating the craft
   * below the headline instead of behind it.
   */
  const camera = isMobile
    ? { position: [0, 1.9, 7] as [number, number, number], fov: 42 }
    : { position: [-2, 1, 5.3] as [number, number, number], fov: 48 };

  return (
    <SceneCanvas className="absolute inset-0 h-full w-full" camera={camera}>
      <HeroScene mouse={mouse} scrollProgress={scrollProgress} />
    </SceneCanvas>
  );
}
