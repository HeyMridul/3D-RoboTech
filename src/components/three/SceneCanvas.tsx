"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, type ReactNode } from "react";
import { useIsMobile, useReducedMotion } from "@/hooks/use-media";

interface SceneCanvasProps {
  children: ReactNode;
  className?: string;
  camera?: { position: [number, number, number]; fov?: number };
  dpr?: [number, number];
}

function SceneFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-charcoal">
      <p className="font-mono-label text-muted animate-pulse">
        INITIALIZING 3D CORE...
      </p>
    </div>
  );
}

export function SceneCanvas({
  children,
  className = "",
  camera = { position: [0, 0, 5], fov: 45 },
  dpr,
}: SceneCanvasProps) {
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();

  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={camera}
        dpr={dpr ?? (isMobile ? [1, 1.5] : [1, 2])}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: isMobile ? "low-power" : "high-performance",
        }}
        frameloop={reducedMotion ? "demand" : "always"}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}

export function SceneLoader() {
  return <SceneFallback />;
}
