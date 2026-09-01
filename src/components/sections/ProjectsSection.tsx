import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/Button";
import { ProjectCard } from "@/components/projects/ProjectCard";

type Project = Awaited<
  ReturnType<typeof import("@/server/services/content").getFeaturedProjects>
>[number];

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section id="projects" className="section-padding bg-graphite/20">
      <div className="container-traic">
        <SectionHeader
          label="PROJECT DATABASE"
          title="What We've Built"
          description="Real engineering projects — from autonomous systems to full-stack applications."
        />

        {projects.length === 0 ? (
          <div className="border border-card-border bg-card p-12 text-center">
            <p className="font-mono-label text-muted mb-2">
              NO PROJECTS FOUND
            </p>
            <p className="text-muted text-sm">
              Project data will appear here once published via the admin dashboard.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <ButtonLink href="/projects" variant="outline" size="lg">
            VIEW ALL PROJECTS
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
