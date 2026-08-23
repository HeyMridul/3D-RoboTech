"use client";

import { Environment, Stars } from "@react-three/drei";
import { DroneCore } from "./DroneCore";
import { ParticleField } from "./ParticleField";
import { DigitalGrid } from "./DigitalGrid";
import { useIsMobile } from "@/hooks/use-media";

interface HeroSceneProps {
  mouse?: { x: number; y: number };
  scrollProgress?: number;
}

export function HeroScene({ mouse, scrollProgress }: HeroSceneProps) {
  const isMobile = useIsMobile();

  return (
    <>
      <color attach="background" args={["#050608"]} />
      <fog attach="fog" args={["#050608", 8, 25]} />

      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-3, 2, 2]} intensity={0.5} color="#00d4ff" />
      <pointLight position={[3, -1, -2]} intensity={0.3} color="#1a6bff" />

      <DroneCore mouse={mouse} scrollProgress={scrollProgress} />
      {!isMobile && <ParticleField />}
      <DigitalGrid />

      {!isMobile && (
        <>
          <Stars radius={50} depth={50} count={1000} factor={2} saturation={0} fade speed={0.5} />
          <Environment preset="city" />
        </>
      )}
    </>
  );
}
