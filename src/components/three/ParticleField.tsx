"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion, useIsMobile } from "@/hooks/use-media";

interface ParticleFieldProps {
  count?: number;
  color?: string;
}

export function ParticleField({ count, color = "#00d4ff" }: ParticleFieldProps) {
  const ref = useRef<THREE.Points>(null);
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const particleCount = count ?? (isMobile ? 200 : 600);

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
      vel[i] = Math.random() * 0.02 + 0.005;
    }
    return [pos, vel];
  }, [particleCount]);

  useFrame(() => {
    if (!ref.current || reducedMotion) return;
    const posArray = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3 + 1] += velocities[i];
      if (posArray[i * 3 + 1] > 10) {
        posArray[i * 3 + 1] = -10;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
