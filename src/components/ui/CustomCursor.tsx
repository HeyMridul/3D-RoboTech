"use client";

import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-media";

export function CustomCursor() {
  const isMobile = useIsMobile();
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState<"default" | "hover" | "rotate">("default");

  useEffect(() => {
    if (isMobile) return;

    document.body.classList.add("custom-cursor-active");

    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-cursor='rotate']")) setMode("rotate");
      else if (target?.closest("a, button, input, textarea, select, [role='button']"))
        setMode("hover");
      else setMode("default");
    };

    window.addEventListener("mousemove", move);
    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", move);
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <div
      className="pointer-events-none fixed z-[400] mix-blend-difference"
      style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -50%)" }}
      aria-hidden
    >
      {mode === "rotate" ? (
        <span className="font-mono-label text-[9px] text-white">ROTATE</span>
      ) : mode === "hover" ? (
        <span className="block w-3 h-3 rounded-full border border-white" />
      ) : (
        <span className="font-mono-label text-white text-sm leading-none">+</span>
      )}
    </div>
  );
}
