import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ProjectModelViewer } from "@/components/three/ProjectModelViewer";
import { getProjectBySlug } from "@/server/services/content";
import { TechBadge } from "@/components/ui/TechBadge";
import { Button } from "@/components/ui/Button";
import { GithubIcon } from "@/components/ui/SocialIcons";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project" };
  return {
    title: project.title,
    description: project.excerpt || project.description,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const sections = [
    { key: "problem", label: "PROBLEM", content: project.problem },
    { key: "solution", label: "SOLUTION", content: project.solution },
    { key: "architecture", label: "ARCHITECTURE", content: project.architecture },
    { key: "hardware", label: "HARDWARE", content: project.hardware },
    { key: "software", label: "SOFTWARE", content: project.software },
    { key: "challenges", label: "CHALLENGES", content: project.challenges },
    { key: "results", label: "RESULTS", content: project.results },
  ].filter((s) => s.content);

  return (
    <div className="pt-24 min-h-screen">
      <div className="relative h-[50vh] min-h-[400px] bg-graphite">
        {project.imageUrl && (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover opacity-60"
            priority
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />
        <div className="container-traic relative h-full flex flex-col justify-end pb-12">
          <p className="font-mono-label text-cyan mb-2">
            PROJECT // {project.slug.slice(0, 8).toUpperCase()}
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
            {project.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            {project.status && (
              <TechBadge variant="green">{project.status}</TechBadge>
            )}
            {project.category && (
              <TechBadge variant="cyan">{project.category.name}</TechBadge>
            )}
            {project.year && (
              <span className="font-mono-label text-muted">{project.year}</span>
            )}
          </div>
        </div>
      </div>

      <div className="container-traic section-padding">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <p className="font-mono-label text-cyan mb-3">OVERVIEW</p>
              <p className="text-lg text-muted leading-relaxed">
                {project.description}
              </p>
            </div>

            <ProjectModelViewer modelUrl={project.modelUrl} />

            {sections.map((section) => (
              <div key={section.key}>
                <p className="font-mono-label text-cyan mb-3">{section.label}</p>
                <div className="text-muted leading-relaxed whitespace-pre-wrap">
                  {section.content}
                </div>
              </div>
            ))}

            {project.gallery.length > 0 && (
              <div>
                <p className="font-mono-label text-cyan mb-4">GALLERY</p>
                <div className="grid grid-cols-2 gap-4">
                  {project.gallery.map((item) => (
                    <div key={item.id} className="relative aspect-video bg-graphite">
                      <Image
                        src={item.imageUrl}
                        alt={item.title || "Gallery image"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="border border-card-border bg-card p-6 sticky top-24">
              <p className="font-mono-label text-cyan mb-4">PROJECT DOSSIER</p>

              {project.technologies.length > 0 && (
                <div className="mb-6">
                  <p className="font-mono-label text-[10px] text-muted mb-2">TECH</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map(({ technology }) => (
                      <TechBadge key={technology.id}>{technology.name}</TechBadge>
                    ))}
                  </div>
                </div>
              )}

              {project.contributors.length > 0 && (
                <div className="mb-6">
                  <p className="font-mono-label text-[10px] text-muted mb-2">TEAM</p>
                  <ul className="space-y-2">
                    {project.contributors.map(({ member, role }) => (
                      <li key={member.id}>
                        <Link
                          href={`/members/${member.slug}`}
                          className="text-sm hover:text-cyan transition-colors"
                        >
                          {member.name}
                        </Link>
                        {role && (
                          <span className="font-mono-label text-[10px] text-muted ml-2">
                            {role}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full">
                      <GithubIcon size={16} /> GITHUB
                    </Button>
                  </a>
                )}
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="primary" className="w-full">
                      <ExternalLink size={16} /> LIVE DEMO
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
