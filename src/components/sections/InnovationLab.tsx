"use client";

import { useEffect, useRef } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SystemStatus } from "@/components/ui/SystemStatus";
import { siteConfig } from "@/config/site";

function NeuralNetworkViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const nodes: { x: number; y: number; vx: number; vy: number }[] = [];
    const count = 30;
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > rect.width) node.vx *= -1;
        if (node.y < 0 || node.y > rect.height) node.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.2 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.fillStyle = "#00d4ff";
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(animate);
    };

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!reducedMotion) animate();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full absolute inset-0"
      aria-hidden
    />
  );
}

export function InnovationLab() {
  return (
    <section id="lab" className="section-padding bg-graphite/40 relative overflow-hidden">
      <div className="absolute inset-0 traic-grid opacity-10" />
      <div className="container-traic relative">
        <SectionHeader
          label="INNOVATION LAB"
          title="The Lab"
          description="Where TRAIC experiments — simulations, visualizations, and digital twins."
        />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 relative border border-card-border bg-card h-80 overflow-hidden">
            <NeuralNetworkViz />
            <div className="absolute bottom-4 left-4 font-mono-label text-[10px] text-cyan">
              NEURAL NETWORK VISUALIZATION // ACTIVE
            </div>
          </div>

          <SystemStatus items={[...siteConfig.systemStatus]} />

          <div className="border border-card-border bg-card p-6">
            <p className="font-mono-label text-cyan mb-3">SENSOR DASHBOARD</p>
            <div className="space-y-3 font-mono-label text-[11px]">
              {[
                { label: "TEMP", value: "24.5°C" },
                { label: "HUMIDITY", value: "42%" },
                { label: "CPU LOAD", value: "23%" },
                { label: "NETWORK", value: "STABLE" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex justify-between border-b border-card-border pb-2"
                >
                  <span className="text-muted">{s.label}</span>
                  <span className="text-green">{s.value}</span>
                </div>
              ))}
            </div>
            <p className="font-mono-label text-[9px] text-muted mt-4">
              * Visual simulation — not live hardware data
            </p>
          </div>

          <div className="border border-card-border bg-card p-6">
            <p className="font-mono-label text-cyan mb-3">CIRCUIT SIM</p>
            <div className="flex items-center justify-center h-32 traic-grid opacity-30">
              <div className="flex gap-4 items-center">
                <div className="w-8 h-8 border border-cyan rounded-full animate-pulse" />
                <div className="w-16 h-px bg-cyan/50" />
                <div className="w-6 h-6 border border-green rotate-45" />
                <div className="w-16 h-px bg-cyan/50" />
                <div className="w-8 h-8 border border-blue" />
              </div>
            </div>
          </div>

          <div className="border border-card-border bg-card p-6">
            <p className="font-mono-label text-cyan mb-3">DRONE TELEMETRY</p>
            <div className="font-mono-label text-[10px] text-muted space-y-1">
              <p>ALT: 12.4m</p>
              <p>SPD: 3.2 m/s</p>
              <p>BAT: 87%</p>
              <p>GPS: LOCKED</p>
            </div>
            <p className="font-mono-label text-[9px] text-muted mt-4">
              * Simulated telemetry display
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
