"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const details: Record<string, string> = {
  BEGINNER: "Start with fundamentals — logic, tools, and how TRAIC builds.",
  PROGRAMMING: "Python, C/C++, and JavaScript as the language layer.",
  ELECTRONICS: "Voltage, current, circuits, and how hardware thinks.",
  SENSORS: "Read the world: IMU, cameras, distance, and environmental data.",
  MICROCONTROLLERS: "Arduino, ESP32, STM32 — firmware that drives machines.",
  ROBOTICS: "Kinematics, control loops, ROS, and mechanical integration.",
  AI: "Perception, models, and deploying intelligence on-device.",
  "AUTONOMOUS SYSTEMS": "Closed-loop robots that plan, navigate, and act.",
  INNOVATION: "Ship projects, compete, teach, and invent the next TRAIC mission.",
};

export function LearningPath() {
  const [active, setActive] = useState<string>(siteConfig.learningPath[0]);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:flex-wrap items-stretch gap-2">
        {siteConfig.learningPath.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActive(step)}
              className={cn(
                "px-4 py-2 border font-mono-label text-[10px] transition-colors",
                active === step
                  ? "border-cyan text-cyan bg-cyan/10"
                  : "border-card-border text-muted hover:border-cyan/40 hover:text-cyan",
              )}
            >
              {String(i + 1).padStart(2, "0")} {step}
            </button>
            {i < siteConfig.learningPath.length - 1 && (
              <span className="hidden md:inline text-cyan/40 font-mono-label">→</span>
            )}
          </div>
        ))}
      </div>
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 border border-card-border bg-card p-6"
      >
        <p className="font-mono-label text-cyan mb-2">TRACK // {active}</p>
        <p className="text-muted">{details[active]}</p>
      </motion.div>
    </div>
  );
}
