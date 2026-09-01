import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { getEventBySlug } from "@/server/services/content";
import { TechBadge } from "@/components/ui/TechBadge";
import { ButtonLink } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event not found" };

  return {
    title: event.title,
    description: event.description.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.description.slice(0, 160),
      type: "article",
      images: event.imageUrl ? [event.imageUrl] : undefined,
    },
  };
}

export default async function EventDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const upcoming = new Date(event.startDate) >= new Date();

  // Structured data helps search engines surface club events.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.startDate.toISOString(),
    ...(event.endDate ? { endDate: event.endDate.toISOString() } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    ...(event.location
      ? { location: { "@type": "Place", name: event.location } }
      : {}),
    organizer: { "@type": "Organization", name: siteConfig.name },
  };

  return (
    <div className="pt-24 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="container-traic section-padding">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ButtonLink href="/events" variant="ghost" size="sm" withArrow={false}>
            ← ALL EVENTS
          </ButtonLink>
        </nav>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <TechBadge variant="cyan">{event.type.replace(/_/g, " ")}</TechBadge>
          <TechBadge variant={upcoming ? "green" : "default"}>
            {upcoming ? "UPCOMING" : "COMPLETED"}
          </TechBadge>
        </div>

        <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
          {event.title}
        </h1>

        <dl className="font-mono-label text-[11px] text-muted flex flex-wrap gap-x-8 gap-y-2 mb-10">
          <div className="flex gap-2">
            <dt>DATE</dt>
            <dd className="text-foreground">
              {formatDate(event.startDate)}
              {event.endDate ? ` — ${formatDate(event.endDate)}` : ""}
            </dd>
          </div>
          {event.location && (
            <div className="flex gap-2">
              <dt>LOCATION</dt>
              <dd className="text-foreground">{event.location}</dd>
            </div>
          )}
        </dl>

        {event.imageUrl && (
          <div className="relative aspect-video mb-10 border border-card-border bg-graphite">
            <Image
              src={event.imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority
            />
          </div>
        )}

        <div className="max-w-3xl text-metallic leading-relaxed whitespace-pre-line">
          {event.description}
        </div>

        {event.registrationUrl && upcoming && (
          <div className="mt-10">
            <ButtonLink href={event.registrationUrl} external size="lg">
              REGISTER
            </ButtonLink>
          </div>
        )}
      </article>
    </div>
  );
}
