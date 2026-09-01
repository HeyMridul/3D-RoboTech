"use client";

import nextDynamic from "next/dynamic";

const InteractiveModel = nextDynamic(
  () => import("./InteractiveModel").then((m) => m.InteractiveModel),
  { ssr: false },
);

export function ProjectModelViewer({ modelUrl }: { modelUrl?: string | null }) {
  return <InteractiveModel modelUrl={modelUrl} />;
}
