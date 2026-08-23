"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { TechBadge } from "@/components/ui/TechBadge";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    slug: string;
    description: string;
    excerpt?: string | null;
    imageUrl?: string | null;
    status?: string;
    year?: number | null;
    category?: { name: string } | null;
    technologies?: { technology: { name: string } }[];
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setHovered(false);
  };

  return (
    <Link href={`/projects/${project.slug}`}>
      <motion.div
        ref={ref}
        style={{ rotateX, rotateY, transformPerspective: 1000 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "group relative border border-card-border bg-card overflow-hidden transition-colors duration-300",
          hovered && "border-cyan/40",
        )}
      >
        <div className="relative aspect-video bg-graphite overflow-hidden">
          {project.imageUrl ? (
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center traic-grid opacity-30">
              <span className="font-mono-label text-muted">NO PREVIEW</span>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-card via-transparent to-transparent" />
          {project.status && (
            <span className="absolute top-3 right-3 font-mono-label text-[10px] px-2 py-1 bg-charcoal/80 text-green border border-green/30">
              {project.status}
            </span>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            {project.category && (
              <TechBadge variant="cyan">{project.category.name}</TechBadge>
            )}
            {project.year && (
              <span className="font-mono-label text-[10px] text-muted">
                {project.year}
              </span>
            )}
          </div>
          <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-cyan transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-muted line-clamp-2 mb-4">
            {project.excerpt || project.description}
          </p>
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.slice(0, 4).map(({ technology }) => (
                <TechBadge key={technology.name}>{technology.name}</TechBadge>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
