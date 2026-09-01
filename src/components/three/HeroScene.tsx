"use client";

import { Environment, Lightformer, Stars } from "@react-three/drei";
import { DroneCore } from "./DroneCore";
import { ParticleField } from "./ParticleField";
import { DigitalGrid } from "./DigitalGrid";
import { SCENE_COLORS } from "./materials";
import { useIsMobile } from "@/hooks/use-media";

interface HeroSceneProps {
  mouse?: { x: number; y: number };
  scrollProgress?: number;
}

export function HeroScene({ mouse, scrollProgress }: HeroSceneProps) {
  const isMobile = useIsMobile();
  const quality = isMobile ? "low" : "high";

  return (
    <>
      <color attach="background" args={[SCENE_COLORS.background]} />
      <fog attach="fog" args={[SCENE_COLORS.background, 7, 22]} />

      {/* Key/fill/rim rig. Kept dim so the emissive accents carry the image. */}
      <ambientLight intensity={0.18} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.1}
        color="#dfe9f5"
        castShadow={!isMobile}
      />
      <pointLight position={[-3.5, 1.5, 2]} intensity={12} color={SCENE_COLORS.cyan} distance={12} />
      <pointLight position={[3, -1.5, -2]} intensity={8} color={SCENE_COLORS.blue} distance={12} />

      {/*
        Local studio environment instead of a `preset`, which would fetch an
        HDR from a CDN at runtime. Lightformers give the machined surfaces
        something to reflect with no network dependency.
      */}
      <Environment resolution={isMobile ? 64 : 256}>
        <Lightformer
          intensity={2}
          position={[0, 4, -3]}
          scale={[10, 4, 1]}
          color="#ffffff"
        />
        <Lightformer
          intensity={3}
          position={[-4, 1, 2]}
          scale={[4, 6, 1]}
          color={SCENE_COLORS.cyan}
        />
        <Lightformer
          intensity={1.5}
          position={[4, 0, 2]}
          scale={[4, 6, 1]}
          color={SCENE_COLORS.blue}
        />
        <Lightformer
          intensity={1}
          position={[0, -4, 1]}
          scale={[10, 3, 1]}
          color="#1b2431"
        />
      </Environment>

      <DroneCore mouse={mouse} scrollProgress={scrollProgress} quality={quality} />

      <DigitalGrid />
      {!isMobile && <ParticleField />}
      {!isMobile && (
        <Stars
          radius={60}
          depth={40}
          count={700}
          factor={2}
          saturation={0}
          fade
          speed={0.4}
        />
      )}
    </>
  );
}
