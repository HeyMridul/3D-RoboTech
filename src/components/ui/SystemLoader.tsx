"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  "INITIALIZING TRAIC SYSTEM...",
  "LOADING ROBOTICS CORE...",
  "LOADING PROJECT DATABASE...",
  "LOADING INNOVATION ENGINE...",
  "SYSTEM READY.",
];

export function SystemLoader({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const visited = sessionStorage.getItem("traic-loaded");
    if (visited) {
      onComplete();
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      sessionStorage.setItem("traic-loaded", "1");
      onComplete();
      return;
    }

    const stepInterval = setInterval(() => {
      setStep((s) => {
        if (s >= steps.length - 1) {
          clearInterval(stepInterval);
          setTimeout(() => {
            sessionStorage.setItem("traic-loaded", "1");
            onComplete();
          }, 400);
          return s;
        }
        return s + 1;
      });
    }, 500);

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 4, 100));
    }, 80);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        /*
         * Decorative: the real content is already mounted underneath, so
         * assistive tech should read that rather than this animation.
         */
        aria-hidden="true"
        className="fixed inset-0 z-[200] bg-charcoal flex flex-col items-center justify-center"
      >
        <p className="font-mono-label text-cyan mb-6 animate-pulse">
          TRAIC // SYSTEM BOOT
        </p>
        <p className="font-mono-label text-sm text-muted mb-4 h-5">
          {steps[step]}
        </p>
        <div className="w-64 h-1 bg-graphite overflow-hidden">
          <motion.div
            className="h-full bg-cyan"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="font-mono-label text-[10px] text-muted mt-2">
          {progress}%
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
