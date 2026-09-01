"use client";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { TechBadge } from "@/components/ui/TechBadge";

type Technology = { id: string; name: string; slug: string };

interface TechStackProps {
  technologies: Technology[];
}

export function TechStack({ technologies }: TechStackProps) {
  const displayTech =
    technologies.length > 0
      ? technologies
      : [
          { id: "1", name: "ROS", slug: "ros" },
          { id: "2", name: "Python", slug: "python" },
          { id: "3", name: "React", slug: "react" },
          { id: "4", name: "ESP32", slug: "esp32" },
          { id: "5", name: "OpenCV", slug: "opencv" },
          { id: "6", name: "TensorFlow", slug: "tensorflow" },
          { id: "7", name: "Node.js", slug: "nodejs" },
          { id: "8", name: "Arduino", slug: "arduino" },
          { id: "9", name: "TypeScript", slug: "typescript" },
          { id: "10", name: "Docker", slug: "docker" },
        ];

  return (
    <section className="section-padding">
      <div className="container-traic">
        <SectionHeader
          label="TECH STACK"
          title="Tools & Technologies"
          description="The engineering stack powering TRAIC projects and workshops."
          align="center"
        />

        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {displayTech.map((tech, i) => (
            <TechBadge
              key={tech.id}
              variant={i % 3 === 0 ? "cyan" : i % 3 === 1 ? "green" : "default"}
              className="text-xs px-4 py-2"
            >
              {tech.name}
            </TechBadge>
          ))}
        </div>
      </div>
    </section>
  );
}
