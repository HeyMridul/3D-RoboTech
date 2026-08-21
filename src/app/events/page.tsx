import { SectionHeader } from "@/components/ui/SectionHeader";
import { getAllEvents } from "@/server/services/content";
import { TechBadge } from "@/components/ui/TechBadge";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Events" };
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getAllEvents();

  return (
    <div className="pt-24 section-padding min-h-screen">
      <div className="container-traic">
        <SectionHeader
          label="EVENT TIMELINE"
          title="Events"
          description="Hackathons, workshops, competitions, and tech talks."
        />

        {events.length === 0 ? (
          <div className="border border-card-border bg-card p-16 text-center">
            <p className="font-mono-label text-muted">NO EVENTS FOUND</p>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl">
            {events.map((event) => (
              <div
                key={event.id}
                className="border border-card-border bg-card p-6 hover:border-cyan/30 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <TechBadge variant="cyan">
                    {event.type.replace("_", " ")}
                  </TechBadge>
                  <span className="font-mono-label text-[10px] text-muted">
                    {formatDate(event.startDate)}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  {event.title}
                </h3>
                <p className="text-muted text-sm">{event.description}</p>
                {event.location && (
                  <p className="font-mono-label text-[10px] text-muted mt-3">
                    LOC: {event.location}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
