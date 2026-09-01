"use client";

import dynamic from "next/dynamic";
import { useMounted, useMousePosition } from "@/hooks/use-media";

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

  if (!mounted) return <SceneLoader />;

  return (
    <SceneCanvas
      className="absolute inset-0 h-full w-full"
      /* Offset left so the craft frames into the right half, clear of the copy */
      camera={{ position: [-2, 1, 5.3], fov: 48 }}
    >
      <HeroScene mouse={mouse} scrollProgress={scrollProgress} />
    </SceneCanvas>
  );
}
