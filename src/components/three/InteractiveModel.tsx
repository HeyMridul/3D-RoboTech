"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";
import { SCENE_COLORS } from "./materials";
import { useIsMobile, useReducedMotion } from "@/hooks/use-media";
import { useContextLoss } from "./useContextLoss";
import { cn } from "@/lib/utils";

/** `Wheel_FL` / `ControlBoard` → `Wheel FL` / `Control Board`. */
function humanise(name: string) {
  return name
    .replace(/[_-]+/g, " ")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .trim();
}

interface PartInfo {
  name: string;
  label: string;
}

function Model({
  url,
  exploded,
  selected,
  onParts,
  onSelect,
}: {
  url: string;
  exploded: boolean;
  selected: string | null;
  onParts: (parts: PartInfo[]) => void;
  onSelect: (name: string | null) => void;
}) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  const reducedMotion = useReducedMotion();

  /**
   * Clone once so several viewers on a page cannot fight over one cached
   * scene graph, and record each mesh's rest position plus the outward
   * direction it travels in the exploded view.
   */
  const { model, meshes } = useMemo(() => {
    const clone = scene.clone(true);
    const found: { mesh: THREE.Mesh; base: THREE.Vector3; dir: THREE.Vector3 }[] = [];

    const box = new THREE.Box3().setFromObject(clone);
    const centre = box.getCenter(new THREE.Vector3());

    clone.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const base = mesh.position.clone();
      const world = mesh.getWorldPosition(new THREE.Vector3());
      const dir = world.sub(centre);
      // Parts sitting exactly at the centroid need some direction to move in
      if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
      found.push({ mesh, base, dir: dir.normalize() });
    });

    return { model: clone, meshes: found };
  }, [scene]);

  useEffect(() => {
    onParts(
      meshes.map(({ mesh }) => ({ name: mesh.name, label: humanise(mesh.name) })),
    );
  }, [meshes, onParts]);

  // Highlight the selected part by tinting its emissive channel.
  useEffect(() => {
    for (const { mesh } of meshes) {
      const material = mesh.material as THREE.MeshStandardMaterial;
      if (!material || !("emissive" in material)) continue;
      if (!mesh.userData.baseEmissive) {
        mesh.userData.baseEmissive = material.emissive.clone();
        mesh.userData.baseIntensity = material.emissiveIntensity;
      }
      const isSelected = selected === mesh.name;
      material.emissive.copy(
        isSelected
          ? new THREE.Color(SCENE_COLORS.cyan)
          : (mesh.userData.baseEmissive as THREE.Color),
      );
      material.emissiveIntensity = isSelected
        ? 0.9
        : (mesh.userData.baseIntensity as number);
    }
  }, [selected, meshes]);

  useFrame((_, delta) => {
    // Ease each part between its rest position and its exploded offset.
    const t = Math.min(1, delta * 6);
    for (const { mesh, base, dir } of meshes) {
      const target = exploded
        ? base.clone().add(dir.clone().multiplyScalar(0.9))
        : base;
      mesh.position.lerp(target, t);
    }

    if (groupRef.current && !exploded && !selected && !reducedMotion) {
      groupRef.current.rotation.y += delta * 0.18;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerMissed={() => onSelect(null)}
      onClick={(event) => {
        event.stopPropagation();
        const name = (event.object as THREE.Mesh).name;
        if (name) onSelect(name === selected ? null : name);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <Center>
        <primitive object={model} />
      </Center>
    </group>
  );
}

function ViewerFallback({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <p className="font-mono-label text-[10px] text-muted animate-pulse">
        {message}
      </p>
    </div>
  );
}

/**
 * Inspect a project's 3D model: orbit, zoom, explode, and select a component
 * to read its name. Rendered only when a project actually has a model, so it
 * never implies hardware that does not exist.
 */
export function InteractiveModel({ url }: { url: string }) {
  const [parts, setParts] = useState<PartInfo[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [exploded, setExploded] = useState(false);
  const isMobile = useIsMobile();
  const { lost, onCreated } = useContextLoss();

  const selectedLabel = parts.find((p) => p.name === selected)?.label;

  return (
    <div className="border border-card-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border px-4 py-3">
        <p className="font-mono-label text-[10px] text-cyan">
          COMPONENT VIEWER
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setExploded((v) => !v)}
            aria-pressed={exploded}
            className={cn(
              "font-mono-label text-[10px] px-3 py-1 border transition-colors",
              exploded
                ? "border-cyan text-cyan bg-cyan/10"
                : "border-card-border text-muted hover:text-foreground",
            )}
          >
            EXPLODED VIEW
          </button>
          {selected && (
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="font-mono-label text-[10px] text-muted hover:text-cyan"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      <div className="relative h-[380px] md:h-[460px] bg-charcoal">
        {lost && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-charcoal text-center px-6">
            <p className="font-mono-label text-[11px] text-orange">
              3D CONTEXT LOST
            </p>
            <p className="text-sm text-muted max-w-xs">
              The browser released the graphics context, usually because too
              many are open at once. Reload the page to inspect the model.
            </p>
          </div>
        )}
        <Suspense fallback={<ViewerFallback message="LOADING MODEL…" />}>
          <Canvas
            camera={{ position: [3.2, 2.2, 3.6], fov: 42 }}
            dpr={isMobile ? [1, 1.5] : [1, 2]}
            onCreated={onCreated}
            gl={{ antialias: !isMobile, powerPreference: isMobile ? "low-power" : "high-performance" }}
          >
            <color attach="background" args={[SCENE_COLORS.background]} />
            {/*
              Lit with plain lights rather than an Environment cubemap. The
              cubemap costs an extra render target for a marginal gain here,
              and it was enough to tip software renderers into losing the
              context on lower-powered machines.
            */}
            <ambientLight intensity={0.7} />
            <directionalLight position={[4, 6, 3]} intensity={2} />
            <directionalLight position={[-3, 2, -4]} intensity={0.8} color={SCENE_COLORS.cyan} />
            <pointLight position={[-4, 2, 2]} intensity={10} color={SCENE_COLORS.cyan} distance={14} />

            <Model
              url={url}
              exploded={exploded}
              selected={selected}
              onParts={setParts}
              onSelect={setSelected}
            />

            <OrbitControls
              makeDefault
              enablePan={false}
              minDistance={2.5}
              maxDistance={9}
              autoRotate={false}
            />
          </Canvas>
        </Suspense>

        {selectedLabel && (
          <div className="absolute left-4 bottom-4 border border-cyan/40 bg-card/90 backdrop-blur-sm px-4 py-3 max-w-[70%]">
            <p className="font-mono-label text-[9px] text-muted mb-1">
              SELECTED COMPONENT
            </p>
            <p className="font-mono-label text-[11px] text-cyan">
              {selectedLabel}
            </p>
          </div>
        )}
      </div>

      {parts.length > 0 && (
        <div className="border-t border-card-border p-4">
          <p className="font-mono-label text-[9px] text-muted mb-3">
            {parts.length} COMPONENTS — SELECT TO HIGHLIGHT
          </p>
          <ul className="flex flex-wrap gap-2">
            {parts.map((part) => (
              <li key={part.name}>
                <button
                  type="button"
                  onClick={() =>
                    setSelected(selected === part.name ? null : part.name)
                  }
                  aria-pressed={selected === part.name}
                  className={cn(
                    "font-mono-label text-[9px] px-2 py-1 border transition-colors",
                    selected === part.name
                      ? "border-cyan text-cyan bg-cyan/10"
                      : "border-card-border text-muted hover:text-foreground hover:border-metallic",
                  )}
                >
                  {part.label}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-muted">
            Drag to orbit, scroll to zoom. The component list is read from the
            model, so it always matches what was uploaded.
          </p>
        </div>
      )}
    </div>
  );
}
