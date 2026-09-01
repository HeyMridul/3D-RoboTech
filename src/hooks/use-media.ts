"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Media queries are external state, so they are read through
 * useSyncExternalStore rather than an effect that calls setState on mount.
 * That avoids the extra render pass (and the tearing it can cause during
 * concurrent rendering) and gives a defined server snapshot.
 */
function useMediaQuery(query: string, serverFallback = false) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = useCallback(() => serverFallback, [serverFallback]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export function useIsMobile(breakpoint = 768) {
  return useMediaQuery(`(max-width: ${breakpoint - 1}px)`);
}

/**
 * Whether to show ⌘ or Ctrl in keyboard hints. Read through the store so it
 * resolves on the first client render instead of flashing the wrong glyph.
 */
export function useIsApplePlatform() {
  return useSyncExternalStore(
    () => () => {},
    () => /Mac|iPhone|iPad|iPod/.test(navigator.userAgent),
    () => false,
  );
}

/** True once mounted on the client; use to defer client-only rendering. */
export function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * Pointer position normalised to -1..1.
 *
 * Returns a ref rather than state: the hero scene reads this every frame in
 * useFrame, and storing it in state would re-render the React tree on every
 * mouse move.
 */
export function useMousePosition() {
  const position = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      position.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return position;
}

/**
 * Throttled scroll offset in pixels, coalesced to one update per frame.
 */
export function useScrollY() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrollY(window.scrollY);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return scrollY;
}
