"use client";

import { DigitalGrid } from "./DigitalGrid";
import { ParticleField } from "./ParticleField";
import { RobotArm } from "./RobotArm";
import { DroneCore } from "./DroneCore";
import { useIsMobile } from "@/hooks/use-media";

export function LabEnvironment({ variant = "arm" }: { variant?: "arm" | "drone" }) {
  const isMobile = useIsMobile();

  return (
    <>
      <color attach="background" args={["#050608"]} />
      <fog attach="fog" args={["#050608", 6, 18]} />
      <ambientLight intensity={0.18} />
      <directionalLight position={[4, 6, 3]} intensity={0.7} />
      <pointLight position={[-2, 2, 2]} intensity={0.5} color="#00d4ff" />
      {variant === "arm" ? <RobotArm /> : <DroneCore />}
      <DigitalGrid />
      {!isMobile && <ParticleField count={180} />}
    </>
  );
}
