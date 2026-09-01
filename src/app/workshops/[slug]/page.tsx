import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { getWorkshopBySlug } from "@/server/services/content";
import { TechBadge } from "@/components/ui/TechBadge";
import { ButtonLink } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const workshop = await getWorkshopBySlug(slug);
  if (!workshop) return { title: "Workshop not found" };

  return {
    title: workshop.title,
    description: workshop.description.slice(0, 160),
    openGraph: {
      title: workshop.title,
      description: workshop.description.slice(0, 160),
      type: "article",
    },
  };
}

export default async function WorkshopDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const workshop = await getWorkshopBySlug(slug);
  if (!workshop) notFound();

  // Resources are stored as free text; one link or note per line.
  const resources =
    workshop.resources
      ?.split("\n")
      .map((line) => line.trim())
      .filter(Boolean) ?? [];

  return (
    <div className="pt-24 min-h-screen">
      <article className="container-traic section-padding">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ButtonLink
            href="/workshops"
            variant="ghost"
            size="sm"
            withArrow={false}
          >
            ← ALL WORKSHOPS
          </ButtonLink>
        </nav>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <TechBadge variant="cyan">{workshop.level}</TechBadge>
          <TechBadge>{workshop.track}</TechBadge>
          <TechBadge variant={workshop.registrationOpen ? "green" : "default"}>
            {workshop.registrationOpen ? "REGISTRATION OPEN" : "CLOSED"}
          </TechBadge>
        </div>

        <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
          {workshop.title}
        </h1>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {workshop.imageUrl && (
              <div className="relative aspect-video mb-8 border border-card-border bg-graphite">
                <Image
                  src={workshop.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 680px"
                />
              </div>
            )}

            <div className="text-metallic leading-relaxed whitespace-pre-line mb-10">
              {workshop.description}
            </div>

            {resources.length > 0 && (
              <section aria-labelledby="resources">
                <h2
                  id="resources"
                  className="font-mono-label text-[11px] text-cyan mb-3"
                >
                  RESOURCES
                </h2>
                <ul className="space-y-2">
                  {resources.map((resource) => (
                    <li key={resource} className="text-sm text-muted">
                      {/^https?:\/\//.test(resource) ? (
                        <a
                          href={resource}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan hover:underline break-all"
                        >
                          {resource}
                        </a>
                      ) : (
                        resource
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside>
            <div className="border border-card-border bg-card p-6 sticky top-28">
              <p className="font-mono-label text-[11px] text-cyan mb-4">
                SESSION DETAILS
              </p>
              <dl className="space-y-3 font-mono-label text-[10px]">
                <div>
                  <dt className="text-muted">INSTRUCTOR</dt>
                  <dd className="text-foreground mt-0.5">
                    {workshop.instructor}
                  </dd>
                </div>
                {workshop.duration && (
                  <div>
                    <dt className="text-muted">DURATION</dt>
                    <dd className="text-foreground mt-0.5">
                      {workshop.duration}
                    </dd>
                  </div>
                )}
                {workshop.startDate && (
                  <div>
                    <dt className="text-muted">DATE</dt>
                    <dd className="text-foreground mt-0.5">
                      {formatDate(workshop.startDate)}
                    </dd>
                  </div>
                )}
                {workshop.maxSeats && (
                  <div>
                    <dt className="text-muted">SEATS</dt>
                    <dd className="text-foreground mt-0.5">
                      {workshop.maxSeats}
                    </dd>
                  </div>
                )}
              </dl>

              {workshop.registrationOpen && (
                <ButtonLink href="/join" className="w-full mt-6">
                  REGISTER INTEREST
                </ButtonLink>
              )}
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}
