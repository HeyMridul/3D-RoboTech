"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/use-media";

export function RobotArm() {
  const base = useRef<THREE.Group>(null);
  const shoulder = useRef<THREE.Group>(null);
  const elbow = useRef<THREE.Group>(null);
  const reduced = useReducedMotion();

  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    if (base.current) base.current.rotation.y = Math.sin(t * 0.4) * 0.6;
    if (shoulder.current) shoulder.current.rotation.z = -0.4 + Math.sin(t * 0.7) * 0.25;
    if (elbow.current) elbow.current.rotation.z = 0.8 + Math.sin(t * 0.9) * 0.3;
  });

  const metal = (
    <meshStandardMaterial color="#2a3140" metalness={0.85} roughness={0.3} />
  );
  const accent = (
    <meshStandardMaterial
      color="#00d4ff"
      emissive="#00d4ff"
      emissiveIntensity={0.35}
      metalness={0.6}
      roughness={0.25}
    />
  );

  return (
    <group position={[0, -1.2, 0]}>
      <mesh>
        <cylinderGeometry args={[0.45, 0.55, 0.18, 16]} />
        {metal}
      </mesh>
      <group ref={base} position={[0, 0.2, 0]}>
        <mesh>
          <boxGeometry args={[0.28, 0.5, 0.28]} />
          {metal}
        </mesh>
        <group ref={shoulder} position={[0, 0.28, 0]}>
          <mesh position={[0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.8, 12]} />
            {metal}
          </mesh>
          <mesh position={[0.75, 0, 0]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            {accent}
          </mesh>
          <group ref={elbow} position={[0.75, 0, 0]}>
            <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.06, 0.06, 0.8, 12]} />
              {metal}
            </mesh>
            <mesh position={[0.85, 0, 0]}>
              <boxGeometry args={[0.18, 0.08, 0.22]} />
              {accent}
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
