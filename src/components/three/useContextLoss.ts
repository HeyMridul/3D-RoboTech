"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RootState } from "@react-three/fiber";

/**
 * Detects WebGL context loss so a scene can show a message instead of a
 * silent white rectangle.
 *
 * Contexts are lost for reasons outside the app's control: browsers cap how
 * many live contexts a page may hold, drivers reset under memory pressure,
 * and software renderers give up on heavy scenes.
 *
 * The event alone is not sufficient evidence. Disposing a renderer also fires
 * `webglcontextlost`, and React Strict Mode mounts effects twice in
 * development, so the first renderer is always torn down — reacting to the
 * raw event reported every dev-mode scene as broken. Instead the event
 * schedules a re-check against whichever renderer is live by then, and only a
 * genuinely lost context sets the flag.
 */
export function useContextLoss() {
  const [lost, setLost] = useState(false);
  const stateRef = useRef<RootState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onCreated = useCallback((state: RootState) => {
    stateRef.current = state;
    // A fresh context means we are healthy again.
    setLost(false);

    const canvas = state.gl.domElement;

    const verify = () => {
      const current = stateRef.current;
      if (!current) return;
      const context = current.gl.getContext();
      setLost(Boolean(context?.isContextLost()));
    };

    canvas.addEventListener("webglcontextlost", (event) => {
      // Required for the browser to attempt a restore.
      event.preventDefault();
      if (timer.current) clearTimeout(timer.current);
      // Let a replacement renderer install itself before judging.
      timer.current = setTimeout(verify, 250);
    });

    canvas.addEventListener("webglcontextrestored", () => setLost(false));
  }, []);

  return { lost, onCreated };
}
