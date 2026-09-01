import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { getProjects, getCategories } from "@/server/services/content";
import { siteConfig } from "@/config/site";
import Link from "next/link";

export const metadata = {
  title: "Projects",
};

export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const category = params.category || "ALL";
  const [projects, categories] = await Promise.all([
    getProjects({ category: category !== "ALL" ? category : undefined }),
    getCategories(),
  ]);

  const filterOptions =
    categories.length > 0
      ? ["ALL", ...categories.map((c) => c.name.toUpperCase())]
      : siteConfig.projectCategories;

  return (
    <div className="pt-24 section-padding min-h-screen">
      <div className="container-traic">
        <SectionHeader
          label="PROJECT DATABASE"
          title="Projects"
          description="Explore engineering dossiers from the TRAIC community."
        />

        <div className="flex flex-wrap gap-2 mb-10">
          {filterOptions.map((cat) => {
            const hrefValue =
              cat === "ALL"
                ? "ALL"
                : cat.toLowerCase().replace(/\s+/g, "-").replace("/", "-");
            const active =
              category.toLowerCase().replace("/", "-") === hrefValue ||
              category === cat;
            return (
              <Link
                key={cat}
                href={`/projects?category=${hrefValue}`}
                className={`font-mono-label text-[10px] px-3 py-1.5 border transition-colors ${
                  active
                    ? "border-cyan text-cyan bg-cyan/5"
                    : "border-card-border text-muted hover:border-cyan/30"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {projects.length === 0 ? (
          <div className="border border-card-border bg-card p-16 text-center">
            <p className="font-mono-label text-muted text-lg mb-2">
              NO PROJECTS FOUND
            </p>
            <p className="text-muted text-sm">
              {category !== "ALL"
                ? `No projects in category "${category}".`
                : "Projects will appear here once published."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
