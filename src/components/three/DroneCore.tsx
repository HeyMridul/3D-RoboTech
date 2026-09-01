"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/use-media";
import {
  SCENE_COLORS,
  chassisMaterial,
  structureMaterial,
  metalMaterial,
  emissive,
} from "./materials";

interface DroneCoreProps {
  /** Live pointer position, read per-frame rather than per-render. */
  mouse?: React.RefObject<{ x: number; y: number }>;
  scrollProgress?: number;
  /** Fewer segments and no rotor blur on low-power devices. */
  quality?: "high" | "low";
}

const ARM_ANGLES = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
const ARM_LENGTH = 1.15;

/**
 * One rotor assembly: motor can, spinning blade pair, and a protective duct.
 * Front rotors carry cyan nav lights, rear rotors amber — an aviation
 * convention that also tells the viewer which way the craft is facing.
 */
function Rotor({
  angle,
  spin,
  isFront,
  quality,
}: {
  angle: number;
  spin: React.RefObject<number>;
  isFront: boolean;
  quality: "high" | "low";
}) {
  const bladeRef = useRef<THREE.Group>(null);
  const x = Math.cos(angle) * ARM_LENGTH;
  const z = Math.sin(angle) * ARM_LENGTH;

  useFrame(() => {
    if (bladeRef.current) bladeRef.current.rotation.y = spin.current;
  });

  const segments = quality === "high" ? 20 : 10;

  return (
    <group position={[x, 0, z]}>
      {/* Motor can */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.105, 0.12, 0.15, segments]} />
        <meshStandardMaterial {...metalMaterial} />
      </mesh>
      {/* Stator detail */}
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.085, 0.085, 0.03, segments]} />
        <meshStandardMaterial {...emissive(SCENE_COLORS.cyan, 0.7)} />
      </mesh>

      {/* Blades */}
      <group ref={bladeRef} position={[0, 0.17, 0]}>
        {[0, Math.PI / 2].map((r) => (
          <mesh key={r} rotation={[0, r, 0]}>
            <boxGeometry args={[0.62, 0.008, 0.055]} />
            <meshStandardMaterial
              color={SCENE_COLORS.panel}
              metalness={0.6}
              roughness={0.5}
              transparent
              opacity={0.85}
            />
          </mesh>
        ))}
      </group>

      {/* Rotor wash disc — reads as motion blur without simulating blades */}
      {quality === "high" && (
        <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.33, 24]} />
          <meshBasicMaterial
            color={SCENE_COLORS.cyan}
            transparent
            opacity={0.05}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Duct / prop guard */}
      <mesh position={[0, 0.17, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.012, 6, segments + 8]} />
        <meshStandardMaterial {...structureMaterial} />
      </mesh>

      {/* Nav light */}
      <mesh position={[0, -0.03, 0]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial
          {...emissive(isFront ? SCENE_COLORS.cyan : SCENE_COLORS.orange, 2.4)}
        />
      </mesh>
      <pointLight
        position={[0, -0.05, 0]}
        distance={0.9}
        intensity={isFront ? 1.2 : 0.6}
        color={isFront ? SCENE_COLORS.cyan : SCENE_COLORS.orange}
      />
    </group>
  );
}

/** Landing platform: hex pad, lit rim, and an outward scanning pulse. */
function Platform({ quality }: { quality: "high" | "low" }) {
  const pulseRef = useRef<THREE.Mesh>(null);
  const reducedMotion = useReducedMotion();

  useFrame((state) => {
    if (!pulseRef.current || reducedMotion) return;
    // 4s sweep: expand outward and fade, then restart
    const t = (state.clock.elapsedTime % 4) / 4;
    const s = 0.6 + t * 2.2;
    pulseRef.current.scale.set(s, s, s);
    const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.5 * (1 - t);
  });

  return (
    <group position={[0, -1.15, 0]}>
      {/* Pad */}
      <mesh receiveShadow>
        <cylinderGeometry args={[1.75, 1.9, 0.1, 6]} />
        <meshStandardMaterial {...structureMaterial} />
      </mesh>
      {/* Inset deck */}
      <mesh position={[0, 0.055, 0]}>
        <cylinderGeometry args={[1.55, 1.55, 0.02, 6]} />
        <meshStandardMaterial {...chassisMaterial} />
      </mesh>

      {/* Lit rim */}
      <mesh position={[0, 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.6, 0.008, 6, quality === "high" ? 64 : 24]} />
        <meshStandardMaterial {...emissive(SCENE_COLORS.cyan, 1.1)} />
      </mesh>

      {/* Concentric alignment rings */}
      {[0.55, 0.95].map((r) => (
        <mesh key={r} position={[0, 0.075, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r, 0.004, 4, quality === "high" ? 48 : 20]} />
          <meshStandardMaterial {...emissive(SCENE_COLORS.blue, 0.5)} />
        </mesh>
      ))}

      {/* Scanning pulse */}
      <mesh ref={pulseRef} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.62, 0.66, quality === "high" ? 48 : 20]} />
        <meshBasicMaterial
          color={SCENE_COLORS.cyan}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/**
 * TRAIC's hero object: an autonomous inspection drone holding station above
 * its charging pad. Fully procedural — no external asset — but structured so
 * a .glb can replace the <Craft/> group without touching the scene.
 */
const ORIGIN = { x: 0, y: 0 };

export function DroneCore({
  mouse,
  scrollProgress = 0,
  quality = "high",
}: DroneCoreProps) {
  const groupRef = useRef<THREE.Group>(null);
  const gimbalRef = useRef<THREE.Group>(null);
  const sensorRingRef = useRef<THREE.Mesh>(null);
  const spin = useRef(0);
  const reducedMotion = useReducedMotion();

  const segments = quality === "high" ? 24 : 12;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const pointer = mouse?.current ?? ORIGIN;

    if (!reducedMotion) {
      // Rotors always turning — the craft reads as powered, not parked
      spin.current += delta * 26;
      if (sensorRingRef.current) sensorRingRef.current.rotation.z = t * 0.35;
    }

    if (groupRef.current) {
      // Slow yaw survey, nudged by the cursor
      const targetY = t * 0.12 + pointer.x * 0.45;
      const targetX = pointer.y * 0.12;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetY,
        0.06,
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetX,
        0.06,
      );
      // Bank slightly into the turn
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        -pointer.x * 0.1,
        0.06,
      );
      // Descend toward the pad as the hero scrolls away
      groupRef.current.position.y = -scrollProgress * 0.6;
    }

    // Camera gimbal tracks the cursor independently of the airframe
    if (gimbalRef.current) {
      gimbalRef.current.rotation.x = THREE.MathUtils.lerp(
        gimbalRef.current.rotation.x,
        -pointer.y * 0.4,
        0.08,
      );
      gimbalRef.current.rotation.y = THREE.MathUtils.lerp(
        gimbalRef.current.rotation.y,
        pointer.x * 0.5,
        0.08,
      );
    }
  });

  const struts = useMemo(
    () => [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4],
    [],
  );

  return (
    <>
      <group ref={groupRef}>
        <Float
          speed={reducedMotion ? 0 : 1.4}
          rotationIntensity={0}
          floatIntensity={reducedMotion ? 0 : 0.35}
        >
          {/* ---- Airframe ---- */}
          {/* Lower hull */}
          <mesh castShadow>
            <cylinderGeometry args={[0.6, 0.52, 0.14, 6]} />
            <meshStandardMaterial {...chassisMaterial} />
          </mesh>
          {/* Upper canopy */}
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.42, 0.6, 0.12, 6]} />
            <meshStandardMaterial {...structureMaterial} />
          </mesh>
          {/* Avionics deck light strip */}
          <mesh position={[0, 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.605, 0.006, 4, 6]} />
            <meshStandardMaterial {...emissive(SCENE_COLORS.cyan, 1.4)} />
          </mesh>

          {/* Rotating sensor ring — the "scanning" tell */}
          <mesh ref={sensorRingRef} position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.3, 0.01, 6, segments]} />
            <meshStandardMaterial {...emissive(SCENE_COLORS.cyan, 1)} />
          </mesh>

          {/* Antenna mast */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.3, 6]} />
            <meshStandardMaterial {...metalMaterial} />
          </mesh>
          <mesh position={[0, 0.46, 0]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial {...emissive(SCENE_COLORS.green, 2)} />
          </mesh>

          {/* ---- Arms ---- */}
          {ARM_ANGLES.map((angle) => (
            <mesh
              key={`arm-${angle}`}
              position={[
                (Math.cos(angle) * ARM_LENGTH) / 2,
                0,
                (Math.sin(angle) * ARM_LENGTH) / 2,
              ]}
              rotation={[0, -angle, 0]}
              castShadow
            >
              <boxGeometry args={[ARM_LENGTH, 0.055, 0.075]} />
              <meshStandardMaterial {...structureMaterial} />
            </mesh>
          ))}

          {/* ---- Rotors ---- */}
          {ARM_ANGLES.map((angle, i) => (
            <Rotor
              key={`rotor-${angle}`}
              angle={angle}
              spin={spin}
              isFront={i === 0 || i === 3}
              quality={quality}
            />
          ))}

          {/* ---- Gimbal camera ---- */}
          <group ref={gimbalRef} position={[0, -0.16, 0]}>
            <mesh>
              <sphereGeometry args={[0.16, segments, segments]} />
              <meshStandardMaterial {...chassisMaterial} />
            </mesh>
            {/* Lens barrel — cylinder defaults to the Y axis, tip it to face +Z */}
            <mesh position={[0, 0, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.075, 0.09, 0.07, segments]} />
              <meshStandardMaterial color="#05070a" metalness={1} roughness={0.05} />
            </mesh>
            <mesh position={[0, 0, 0.17]}>
              <circleGeometry args={[0.062, segments]} />
              <meshStandardMaterial {...emissive(SCENE_COLORS.cyan, 2.6)} />
            </mesh>
            <pointLight position={[0, 0, 0.3]} distance={2} intensity={2} color={SCENE_COLORS.cyan} />
          </group>

          {/* ---- Landing struts ---- */}
          {struts.map((angle) => (
            <mesh
              key={`strut-${angle}`}
              position={[Math.cos(angle) * 0.42, -0.3, Math.sin(angle) * 0.42]}
              rotation={[Math.cos(angle) * 0.3, 0, -Math.sin(angle) * 0.3]}
            >
              <cylinderGeometry args={[0.014, 0.014, 0.4, 6]} />
              <meshStandardMaterial {...metalMaterial} />
            </mesh>
          ))}
        </Float>
      </group>

      <Platform quality={quality} />
    </>
  );
}
