import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getMemberBySlug } from "@/server/services/content";
import { TechBadge } from "@/components/ui/TechBadge";
import { GithubIcon, LinkedinIcon } from "@/components/ui/SocialIcons";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = await getMemberBySlug(slug);
  if (!member) notFound();

  return (
    <div className="pt-24 section-padding min-h-screen">
      <div className="container-traic max-w-4xl">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <div className="relative aspect-square bg-graphite border border-card-border mb-6">
              {member.photoUrl ? (
                <Image
                  src={member.photoUrl}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-6xl text-metallic">
                    {member.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            <div className="border border-card-border bg-card p-4 font-mono-label text-[11px] space-y-2">
              <p className="text-cyan">SYSTEM PROFILE</p>
              <p>
                <span className="text-muted">ROLE:</span> {member.role}
              </p>
              <p>
                <span className="text-muted">CATEGORY:</span>{" "}
                {member.category.replace("_", " ")}
              </p>
              <p>
                <span className="text-muted">PROJECTS:</span>{" "}
                {member.projects.length}
              </p>
              <p>
                <span className="text-muted">STATUS:</span>{" "}
                <span className="text-green">
                  {member.active ? "ACTIVE" : "INACTIVE"}
                </span>
              </p>
            </div>

            <div className="flex gap-3 mt-4">
              {member.githubUrl && (
                <a
                  href={member.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border border-card-border hover:border-cyan text-muted hover:text-cyan transition-colors"
                  aria-label="GitHub"
                >
                  <GithubIcon size={18} />
                </a>
              )}
              {member.linkedinUrl && (
                <a
                  href={member.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border border-card-border hover:border-cyan text-muted hover:text-cyan transition-colors"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon size={18} />
                </a>
              )}
              {member.portfolioUrl && (
                <a
                  href={member.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border border-card-border hover:border-cyan text-muted hover:text-cyan transition-colors"
                  aria-label="Portfolio"
                >
                  <ExternalLink size={18} />
                </a>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="font-mono-label text-cyan mb-2">MEMBER PROFILE</p>
            <h1 className="font-display text-4xl font-bold mb-6">{member.name}</h1>

            {member.bio && (
              <p className="text-muted leading-relaxed mb-8">{member.bio}</p>
            )}

            {member.skills.length > 0 && (
              <div className="mb-8">
                <p className="font-mono-label text-cyan mb-3">SKILLS</p>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((s) => (
                    <TechBadge key={s} variant="cyan">
                      {s}
                    </TechBadge>
                  ))}
                </div>
              </div>
            )}

            {member.projects.length > 0 && (
              <div className="mb-8">
                <p className="font-mono-label text-cyan mb-3">PROJECTS</p>
                <ul className="space-y-2">
                  {member.projects.map(({ project }) => (
                    <li key={project.id}>
                      <Link
                        href={`/projects/${project.slug}`}
                        className="text-muted hover:text-cyan transition-colors"
                      >
                        {project.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {member.achievements.length > 0 && (
              <div>
                <p className="font-mono-label text-cyan mb-3">ACHIEVEMENTS</p>
                <ul className="space-y-2">
                  {member.achievements.map(({ achievement }) => (
                    <li key={achievement.id} className="text-sm text-muted">
                      {achievement.year} — {achievement.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
