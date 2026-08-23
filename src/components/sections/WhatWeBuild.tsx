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

        <div className="relative flex flex-col items-center py-12">
          {/* Root node */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10 px-8 py-4 border-2 border-cyan bg-cyan/10 font-mono-label text-cyan text-sm glow-cyan"
          >
            {root}
          </motion.div>

          {/* Connector line */}
          <div className="w-px h-12 bg-gradient-to-b from-cyan to-card-border" />

          {/* Child nodes grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 w-full max-w-4xl">
            {nodes.map((node, i) => (
              <motion.div
                key={node}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-px h-6 bg-card-border group-first:hidden" />
                <div className="border border-card-border bg-card/50 p-4 text-center hover:border-cyan/40 hover:bg-cyan/5 transition-all duration-300">
                  <p className="font-mono-label text-[11px] text-muted group-hover:text-cyan transition-colors">
                    {node}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
