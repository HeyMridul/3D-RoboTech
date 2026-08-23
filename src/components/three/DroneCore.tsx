"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/use-media";

interface DroneCoreProps {
  mouse?: { x: number; y: number };
  scrollProgress?: number;
}

export function DroneCore({ mouse = { x: 0, y: 0 }, scrollProgress = 0 }: DroneCoreProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const reducedMotion = useReducedMotion();

  useFrame((state) => {
    if (!groupRef.current || reducedMotion) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.15 + mouse.x * 0.3;
    groupRef.current.rotation.x = mouse.y * 0.15;
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.15 + scrollProgress * -0.5;
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.5;
    }
  });

  const armPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      positions.push([Math.cos(angle) * 1.2, 0, Math.sin(angle) * 1.2]);
    }
    return positions;
  }, []);

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
        {/* Central core */}
        <mesh castShadow>
          <icosahedronGeometry args={[0.5, 1]} />
          <MeshDistortMaterial
            color="#00d4ff"
            emissive="#003344"
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.2}
            distort={0.15}
            speed={2}
          />
        </mesh>

        {/* Platform base */}
        <mesh position={[0, -0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.5, 1.8, 0.1, 6]} />
          <meshStandardMaterial
            color="#1a1f28"
            metalness={0.8}
            roughness={0.4}
          />
        </mesh>

        {/* Rotating ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.9, 0.02, 8, 64]} />
          <meshStandardMaterial
            color="#00d4ff"
            emissive="#00d4ff"
            emissiveIntensity={0.3}
            metalness={1}
            roughness={0.2}
          />
        </mesh>

        {/* Drone arms */}
        {armPositions.map((pos, i) => (
          <group key={i} position={pos}>
            <mesh rotation={[0, -Math.atan2(pos[2], pos[0]), 0]}>
              <boxGeometry args={[1.2, 0.04, 0.04]} />
              <meshStandardMaterial color="#2a3140" metalness={0.9} roughness={0.3} />
            </mesh>
            <mesh position={[0.6, 0.1, 0]}>
              <cylinderGeometry args={[0.25, 0.25, 0.02, 16]} />
              <meshStandardMaterial
                color="#141820"
                emissive="#00ff88"
                emissiveIntensity={0.1}
                transparent
                opacity={0.8}
              />
            </mesh>
          </group>
        ))}

        {/* Sensor nodes */}
        {[0, 1, 2].map((i) => (
          <mesh
            key={`sensor-${i}`}
            position={[
              Math.cos((i / 3) * Math.PI * 2) * 0.7,
              0.3,
              Math.sin((i / 3) * Math.PI * 2) * 0.7,
            ]}
          >
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial
              color="#1a6bff"
              emissive="#1a6bff"
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
      </Float>
    </group>
  );
}
