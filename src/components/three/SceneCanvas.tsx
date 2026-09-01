"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, type ReactNode } from "react";
import { useIsMobile, useReducedMotion } from "@/hooks/use-media";
import { useContextLoss } from "./useContextLoss";

interface SceneCanvasProps {
  children: ReactNode;
  className?: string;
  camera?: { position: [number, number, number]; fov?: number };
  dpr?: [number, number];
}

function SceneFallback() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-charcoal"
      aria-hidden="true"
    >
      <p className="font-mono-label text-[11px] text-muted animate-pulse">
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
  const { lost, onCreated } = useContextLoss();

  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={camera}
        // Cap device pixel ratio: retina phones would otherwise render 3x the
        // pixels for a background element.
        dpr={dpr ?? (isMobile ? [1, 1.5] : [1, 2])}
        onCreated={onCreated}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: isMobile ? "low-power" : "high-performance",
        }}
        /*
         * With reduced motion the scene is static, so render on demand rather
         * than burning a frame budget redrawing an unchanging image.
         */
        frameloop={reducedMotion ? "demand" : "always"}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>

      {/*
        Decorative scene: if the context is lost the page is still complete
        without it, so this stays quiet rather than raising an error.
      */}
      {lost && <div className="absolute inset-0 bg-charcoal" aria-hidden="true" />}
    </div>
  );
}

export function SceneLoader() {
  return <SceneFallback />;
}
