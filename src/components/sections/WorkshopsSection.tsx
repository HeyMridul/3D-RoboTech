import { SectionHeader } from "@/components/ui/SectionHeader";
import { TechBadge } from "@/components/ui/TechBadge";
import { ButtonLink } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site";

type Workshop = Awaited<
  ReturnType<typeof import("@/server/services/content").getWorkshops>
>[number];

interface WorkshopsSectionProps {
  workshops: Workshop[];
}

export function WorkshopsSection({ workshops }: WorkshopsSectionProps) {
  return (
    <section id="workshops" className="section-padding bg-graphite/30">
      <div className="container-traic">
        <SectionHeader
          label="LEARNING ENGINE"
          title="Learn. Build. Repeat."
          description="Technical workshops and learning tracks for every skill level."
        />

        {/* Learning path */}
        <div className="mb-16 overflow-x-auto pb-4">
          <div className="flex items-center gap-2 min-w-max px-2">
            {siteConfig.learningPath.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="px-4 py-2 border border-card-border bg-card font-mono-label text-[10px] text-muted hover:border-cyan/40 hover:text-cyan transition-colors">
                  {step}
                </div>
                {i < siteConfig.learningPath.length - 1 && (
                  <span className="text-cyan/40">↓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tracks */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Object.entries(siteConfig.workshopTracks).map(([track, items]) => (
            <div
              key={track}
              className="border border-card-border bg-card p-5"
            >
              <p className="font-mono-label text-cyan mb-4 capitalize">
                {track}
              </p>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-muted hover:text-foreground transition-colors"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Workshop cards */}
        {workshops.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.slice(0, 6).map((workshop) => (
              <div
                key={workshop.id}
                className="border border-card-border bg-card/50 p-6 hover:border-cyan/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <TechBadge variant="cyan">{workshop.level}</TechBadge>
                  <TechBadge>{workshop.track}</TechBadge>
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">
                  {workshop.title}
                </h3>
                <p className="text-sm text-muted line-clamp-2 mb-4">
                  {workshop.description}
                </p>
                <div className="font-mono-label text-[10px] text-muted space-y-1">
                  <p>INSTRUCTOR: {workshop.instructor}</p>
                  {workshop.duration && <p>DURATION: {workshop.duration}</p>}
                  {workshop.startDate && (
                    <p>DATE: {formatDate(workshop.startDate)}</p>
                  )}
                  <p
                    className={
                      workshop.registrationOpen ? "text-green" : "text-orange"
                    }
                  >
                    {workshop.registrationOpen
                      ? "REGISTRATION OPEN"
                      : "REGISTRATION CLOSED"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-card-border bg-card p-8 text-center">
            <p className="font-mono-label text-muted">
              WORKSHOP SCHEDULE LOADING...
            </p>
          </div>
        )}

        <div className="mt-10 text-center">
          <ButtonLink href="/workshops" variant="outline">
            ALL WORKSHOPS
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
