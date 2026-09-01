"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TechBadge } from "@/components/ui/TechBadge";
import { siteConfig } from "@/config/site";

const categoryDetails: Record<string, { description: string; tech: string[] }> = {
  robotics: {
    description: "Design, build, and deploy autonomous robotic systems.",
    tech: ["ROS", "Motor Control", "Kinematics", "SLAM"],
  },
  "ai-ml": {
    description: "Train models and deploy intelligent systems in the real world.",
    tech: ["PyTorch", "TensorFlow", "Computer Vision", "NLP"],
  },
  iot: {
    description: "Connect sensors, devices, and cloud infrastructure.",
    tech: ["ESP32", "MQTT", "Node-RED", "Cloud IoT"],
  },
  software: {
    description: "Build full-stack applications and developer tools.",
    tech: ["React", "Node.js", "Python", "TypeScript"],
  },
  automation: {
    description: "Automate workflows and industrial processes.",
    tech: ["PLC", "Python Scripts", "RPA", "Scheduling"],
  },
  embedded: {
    description: "Program microcontrollers and embedded hardware.",
    tech: ["Arduino", "STM32", "FreeRTOS", "C/C++"],
  },
  drones: {
    description: "Design and fly autonomous aerial systems.",
    tech: ["Flight Control", "GPS", "FPV", "Computer Vision"],
  },
  research: {
    description: "Explore cutting-edge technology and publish findings.",
    tech: ["Paper Review", "Prototyping", "Testing", "Documentation"],
  },
};

export function WhoWeAre() {
  const [active, setActive] = useState<string>(siteConfig.traicCore[0].key);

  const details = categoryDetails[active] ?? categoryDetails.robotics;

  return (
    <section id="about" className="section-padding bg-graphite/30">
      <div className="container-traic">
        <SectionHeader
          label="TRAIC CORE"
          title="Who We Are"
          description="A multidisciplinary community engineering the future through robotics, AI, and innovation."
        />

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-2">
            {siteConfig.traicCore.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActive(item.key)}
                className={`w-full text-left px-4 py-3 border transition-all duration-300 font-mono-label text-sm ${
                  active === item.key
                    ? "border-cyan bg-cyan/5 text-cyan"
                    : "border-card-border text-muted hover:border-cyan/30 hover:text-foreground"
                }`}
              >
                <span className="text-cyan/60 mr-3">{item.id}</span>
                {item.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="border border-card-border bg-card p-8"
            >
              <p className="font-mono-label text-cyan mb-4">
                {"// "}
                {active.toUpperCase()}
              </p>
              <p className="text-lg text-foreground mb-6 leading-relaxed">
                {details.description}
              </p>
              <p className="font-mono-label text-muted mb-3">TECHNOLOGIES</p>
              <div className="flex flex-wrap gap-2">
                {details.tech.map((t) => (
                  <TechBadge key={t} variant="cyan">
                    {t}
                  </TechBadge>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
