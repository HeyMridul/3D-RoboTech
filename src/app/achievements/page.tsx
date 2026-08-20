import { SectionHeader } from "@/components/ui/SectionHeader";
import { getAchievements } from "@/server/services/content";

export const metadata = { title: "Achievements" };
export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const achievements = await getAchievements();

  return (
    <div className="pt-24 section-padding min-h-screen">
      <div className="container-traic">
        <SectionHeader
          label="MISSION LOG"
          title="TRAIC Mission Log"
          description="Competition wins, awards, and milestones. Demo content marked where applicable."
        />

        {achievements.length === 0 ? (
          <div className="border border-card-border bg-card p-16 text-center">
            <p className="font-mono-label text-muted">MISSION LOG EMPTY</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {achievements.map((a) => (
              <div
                key={a.id}
                className="flex gap-6 border border-card-border bg-card/50 p-6 hover:border-cyan/30 transition-colors"
              >
                <div className="font-mono-label text-cyan shrink-0">
                  <p className="text-3xl font-bold">{a.year}</p>
                  {a.missionNumber && (
                    <p className="text-[10px] text-muted mt-1">
                      MISSION {String(a.missionNumber).padStart(3, "0")}
                    </p>
                  )}
                </div>
                <div>
                  {a.rank && (
                    <p className="font-mono-label text-green text-[11px] mb-1">
                      {a.rank}
                    </p>
                  )}
                  <h3 className="font-display text-xl font-semibold">{a.title}</h3>
                  <p className="text-muted text-sm mt-2">{a.description}</p>
                  {a.organization && (
                    <p className="font-mono-label text-[10px] text-muted mt-2">
                      {a.organization}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
