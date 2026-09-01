"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { siteConfig } from "@/config/site";

export function WhatWeBuild() {
  const { root, nodes } = siteConfig.ecosystem;

  return (
    <section className="section-padding">
      <div className="container-traic">
        <SectionHeader
          label="ECOSYSTEM MAP"
          title="What We Build"
          description="An interconnected engineering ecosystem spanning hardware, software, and intelligent systems."
        />

        <div className="relative border border-card-border bg-card/40 p-8 md:p-12 overflow-hidden">
          <div className="absolute inset-0 traic-grid opacity-20 pointer-events-none" />
          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="px-8 py-4 border border-cyan bg-cyan/10 font-mono-label text-cyan text-sm"
            >
              {root}
            </motion.div>
            <svg className="w-px h-10 overflow-visible" aria-hidden>
              <line x1="0" y1="0" x2="0" y2="40" stroke="#00d4ff" strokeOpacity="0.4" />
            </svg>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
              {nodes.map((node, i) => (
                <motion.div
                  key={node}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="border border-card-border bg-charcoal/80 p-4 text-center hover:border-cyan/40 transition-colors"
                >
                  <p className="font-mono-label text-[10px] text-muted mb-1">
                    NODE {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="font-mono-label text-[11px] text-foreground">{node}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
