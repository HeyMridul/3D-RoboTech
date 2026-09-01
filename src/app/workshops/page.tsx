import { SectionHeader } from "@/components/ui/SectionHeader";
import { getWorkshops } from "@/server/services/content";
import { TechBadge } from "@/components/ui/TechBadge";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { LearningPath } from "@/components/ui/LearningPath";

export const metadata = { title: "Workshops" };
export const dynamic = "force-dynamic";

export default async function WorkshopsPage() {
  const workshops = await getWorkshops();

  return (
    <div className="pt-24 section-padding min-h-screen">
      <div className="container-traic">
        <SectionHeader
          label="LEARNING ENGINE"
          title="Learn. Build. Repeat."
          description="Technical workshops and learning tracks for every skill level."
        />

        <div className="mb-16">
          <p className="font-mono-label text-cyan mb-4">INTERACTIVE ROADMAP</p>
          <LearningPath />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {Object.entries(siteConfig.workshopTracks).map(([track, items]) => (
            <div key={track} className="border border-card-border bg-card p-5">
              <p className="font-mono-label text-cyan mb-4 capitalize">{track}</p>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item} className="text-sm text-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {workshops.length === 0 ? (
          <div className="border border-card-border bg-card p-16 text-center">
            <p className="font-mono-label text-muted">NO WORKSHOPS SCHEDULED</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {workshops.map((w) => (
              <div
                key={w.id}
                className="border border-card-border bg-card/50 p-6 hover:border-cyan/30 transition-colors"
              >
                <div className="flex gap-2 mb-3">
                  <TechBadge variant="cyan">{w.level}</TechBadge>
                  <TechBadge>{w.track}</TechBadge>
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  {w.title}
                </h3>
                <p className="text-muted text-sm mb-4">{w.description}</p>
                <div className="font-mono-label text-[10px] text-muted space-y-1">
                  <p>INSTRUCTOR: {w.instructor}</p>
                  {w.duration && <p>DURATION: {w.duration}</p>}
                  {w.startDate && <p>DATE: {formatDate(w.startDate)}</p>}
                  <p className={w.registrationOpen ? "text-green" : "text-orange"}>
                    {w.registrationOpen ? "OPEN" : "CLOSED"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
