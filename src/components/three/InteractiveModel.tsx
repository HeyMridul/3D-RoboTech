"use client";

import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import { useState } from "react";
import { SceneCanvas } from "./SceneCanvas";

const COMPONENTS = [
  { id: "ESP32", position: [0, 0.35, 0] as [number, number, number], info: "Main compute and wireless control." },
  { id: "MOTOR", position: [0.7, -0.1, 0.4] as [number, number, number], info: "Drive actuator with encoder feedback." },
  { id: "SENSOR", position: [-0.55, 0.2, 0.3] as [number, number, number], info: "Environmental / proximity sensing." },
  { id: "CAMERA", position: [0, 0.55, 0.4] as [number, number, number], info: "Computer vision payload." },
  { id: "BATTERY", position: [0, -0.25, 0] as [number, number, number], info: "Power distribution pack." },
  { id: "CONTROL BOARD", position: [0.2, 0.05, -0.3] as [number, number, number], info: "Motor drivers and I/O." },
];

function ProceduralRobot({ exploded }: { exploded: boolean }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <group>
      <mesh>
        <boxGeometry args={[1.2, 0.35, 0.8]} />
        <meshStandardMaterial color="#1a1f28" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.7, 0.35, 0.5]} />
        <meshStandardMaterial color="#12151c" metalness={0.7} roughness={0.4} />
      </mesh>
      {COMPONENTS.map((c) => {
        const pos = exploded
          ? ([c.position[0] * 1.8, c.position[1] * 1.8 + 0.2, c.position[2] * 1.8] as [
              number,
              number,
              number,
            ])
          : c.position;
        return (
          <group key={c.id} position={pos}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                setActive(c.id);
              }}
              onPointerOver={() => {
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "auto";
              }}
            >
              <boxGeometry args={[0.22, 0.14, 0.18]} />
              <meshStandardMaterial
                color={active === c.id ? "#00d4ff" : "#2a3140"}
                emissive={active === c.id ? "#00d4ff" : "#000000"}
                emissiveIntensity={active === c.id ? 0.4 : 0}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
            {active === c.id && (
              <Html distanceFactor={8} position={[0, 0.25, 0]}>
                <div className="font-mono-label text-[9px] bg-charcoal/90 border border-cyan/40 text-cyan px-2 py-1 whitespace-nowrap">
                  {c.id} — {c.info}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

function GltfModel({ url }: { url: string }) {
  const gltf = useGLTF(url);
  return <primitive object={gltf.scene} />;
}

interface InteractiveModelProps {
  modelUrl?: string | null;
}

export function InteractiveModel({ modelUrl }: InteractiveModelProps) {
  const [exploded, setExploded] = useState(false);

  return (
    <div className="relative border border-card-border bg-card h-[420px]" data-cursor="rotate">
      <SceneCanvas camera={{ position: [2.4, 1.6, 2.8], fov: 45 }} className="h-full w-full">
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 4, 2]} intensity={1} />
        <pointLight position={[-2, 1, 2]} intensity={0.4} color="#00d4ff" />
        {modelUrl ? <GltfModel url={modelUrl} /> : <ProceduralRobot exploded={exploded} />}
        <OrbitControls enablePan={false} minDistance={2} maxDistance={8} />
      </SceneCanvas>
      <div className="absolute top-3 left-3 font-mono-label text-[10px] text-cyan">
        3D INSPECTOR
      </div>
      {!modelUrl && (
        <button
          type="button"
          onClick={() => setExploded((v) => !v)}
          className="absolute bottom-3 right-3 font-mono-label text-[10px] px-3 py-1 border border-cyan/40 text-cyan hover:bg-cyan/10"
        >
          {exploded ? "ASSEMBLED VIEW" : "EXPLODED VIEW"}
        </button>
      )}
    </div>
  );
}
