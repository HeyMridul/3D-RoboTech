"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion, useIsMobile } from "@/hooks/use-media";
import { SCENE_COLORS } from "./materials";

interface ParticleFieldProps {
  count?: number;
  color?: string;
  /** Change to get a different but still reproducible layout. */
  seed?: number;
}

/**
 * Deterministic PRNG (mulberry32).
 *
 * Math.random() during render is impure — it makes the component produce a
 * different tree on every pass, which the React Compiler flags and which
 * would desynchronise a server and client render. Seeding keeps the field
 * reproducible.
 */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SPREAD = 20;
const CEILING = 10;

export function ParticleField({
  count,
  color = SCENE_COLORS.cyan,
  seed = 1337,
}: ParticleFieldProps) {
  const ref = useRef<THREE.Points>(null);
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();

  // Mobile GPUs get a third of the particles.
  const particleCount = count ?? (isMobile ? 200 : 600);

  const { positions, velocities } = useMemo(() => {
    const random = mulberry32(seed);
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (random() - 0.5) * SPREAD;
      pos[i * 3 + 1] = (random() - 0.5) * SPREAD;
      pos[i * 3 + 2] = (random() - 0.5) * SPREAD;
      vel[i] = random() * 0.02 + 0.005;
    }
    return { positions: pos, velocities: vel };
  }, [particleCount, seed]);

  useFrame((_, delta) => {
    if (!ref.current || reducedMotion) return;
    const attribute = ref.current.geometry.attributes.position;
    const array = attribute.array as Float32Array;
    // Scale by delta so drift speed does not depend on frame rate.
    const step = delta * 60;
    for (let i = 0; i < particleCount; i++) {
      const y = i * 3 + 1;
      array[y] += velocities[i] * step;
      if (array[y] > CEILING) array[y] = -CEILING;
    }
    attribute.needsUpdate = true;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color={color}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
