"use client";

import nextDynamic from "next/dynamic";

const SceneCanvas = nextDynamic(
  () => import("./SceneCanvas").then((m) => m.SceneCanvas),
  { ssr: false },
);
const LabEnvironment = nextDynamic(
  () => import("./LabEnvironment").then((m) => m.LabEnvironment),
  { ssr: false },
);

export function LabCanvas({ variant = "arm" }: { variant?: "arm" | "drone" }) {
  return (
    <div className="h-[420px] border border-card-border bg-card" data-cursor="rotate">
      <SceneCanvas className="h-full w-full" camera={{ position: [2.2, 1.4, 3.4], fov: 50 }}>
        <LabEnvironment variant={variant} />
      </SceneCanvas>
    </div>
  );
}
