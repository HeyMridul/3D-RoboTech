"use client";

import dynamic from "next/dynamic";

/**
 * Client boundary for the component viewer. The three.js bundle is pulled in
 * only for projects that actually have a model, keeping it off every other
 * project page.
 */
const InteractiveModel = dynamic(
  () => import("@/components/three/InteractiveModel").then((m) => m.InteractiveModel),
  {
    ssr: false,
    loading: () => (
      <div className="border border-card-border bg-card h-[460px] flex items-center justify-center">
        <p className="font-mono-label text-[10px] text-muted animate-pulse">
          INITIALIZING COMPONENT VIEWER…
        </p>
      </div>
    ),
  },
);

export function ProjectModel({ url }: { url: string }) {
  return <InteractiveModel url={url} />;
}
