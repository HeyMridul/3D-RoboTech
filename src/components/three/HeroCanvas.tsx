"use client";

import dynamic from "next/dynamic";
import { useMousePosition } from "@/hooks/use-media";

const SceneCanvas = dynamic(
  () => import("./SceneCanvas").then((m) => m.SceneCanvas),
  { ssr: false, loading: () => <SceneLoader /> },
);

const HeroScene = dynamic(
  () => import("./HeroScene").then((m) => m.HeroScene),
  { ssr: false },
);

function SceneLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-charcoal/50">
      <p className="font-mono-label text-cyan animate-pulse">
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

  return (
    <SceneCanvas
      className="absolute inset-0 h-full w-full"
      camera={{ position: [0, 1, 6], fov: 50 }}
    >
      <HeroScene mouse={mouse} scrollProgress={scrollProgress} />
    </SceneCanvas>
  );
}
