import { SectionHeader } from "@/components/ui/SectionHeader";
import { TechBadge } from "@/components/ui/TechBadge";
import { ButtonLink } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

type Event = Awaited<
  ReturnType<typeof import("@/server/services/content").getAllEvents>
>[number];

interface EventsSectionProps {
  events: Event[];
}

export function EventsSection({ events }: EventsSectionProps) {
  return (
    <section id="events" className="section-padding">
      <div className="container-traic">
        <SectionHeader
          label="EVENT TIMELINE"
          title="Events & Activities"
          description="Hackathons, workshops, competitions, and tech talks shaping the TRAIC community."
        />

        {events.length === 0 ? (
          <div className="border border-card-border bg-card p-12 text-center">
            <p className="font-mono-label text-muted">NO EVENTS SCHEDULED</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-card-border md:-translate-x-px" />
            <div className="space-y-8">
              {events.slice(0, 5).map((event, i) => (
                <div
                  key={event.id}
                  className={`relative flex flex-col md:flex-row gap-6 ${
                    i % 2 === 0 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className="hidden md:block md:w-1/2" />
                  <div
                    className={`md:w-1/2 pl-12 md:pl-0 ${
                      i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                    }`}
                  >
                    <div className="border border-card-border bg-card p-6 hover:border-cyan/30 transition-colors">
                      <div
                        className={`flex items-center gap-2 mb-3 ${
                          i % 2 === 0 ? "md:justify-end" : ""
                        }`}
                      >
                        <TechBadge variant="cyan">
                          {event.type.replace("_", " ")}
                        </TechBadge>
                        <span className="font-mono-label text-[10px] text-muted">
                          {formatDate(event.startDate)}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-semibold mb-2">
                        {event.title}
                      </h3>
                      <p className="text-sm text-muted line-clamp-2">
                        {event.description}
                      </p>
                      {event.location && (
                        <p className="font-mono-label text-[10px] text-muted mt-3">
                          LOC: {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="absolute left-4 md:left-1/2 w-3 h-3 -translate-x-1/2 bg-cyan border-2 border-charcoal rounded-full mt-6" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <ButtonLink href="/events" variant="outline">
            VIEW ALL EVENTS
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
