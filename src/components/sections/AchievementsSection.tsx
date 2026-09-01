import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/Button";

type Achievement = Awaited<
  ReturnType<typeof import("@/server/services/content").getAchievements>
>[number];

interface AchievementsSectionProps {
  achievements: Achievement[];
}

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
  return (
    <section id="achievements" className="section-padding bg-graphite/30">
      <div className="container-traic">
        <SectionHeader
          label="MISSION LOG"
          title="TRAIC Mission Log"
          description="Competition wins, awards, and milestones from our engineering journey."
        />

        {achievements.length === 0 ? (
          <div className="border border-card-border bg-card p-12 text-center">
            <p className="font-mono-label text-muted">MISSION LOG EMPTY</p>
            <p className="text-sm text-muted mt-2">
              Achievements will be logged here once added via CMS.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {achievements.slice(0, 8).map((achievement) => (
              <div
                key={achievement.id}
                className="group flex gap-6 border border-card-border bg-card/50 p-6 hover:border-cyan/30 transition-all"
              >
                <div className="font-mono-label text-cyan shrink-0">
                  <p className="text-2xl font-bold">{achievement.year}</p>
                  {achievement.missionNumber && (
                    <p className="text-[10px] text-muted mt-1">
                      MISSION {String(achievement.missionNumber).padStart(3, "0")}
                    </p>
                  )}
                </div>
                <div>
                  {achievement.rank && (
                    <p className="font-mono-label text-green text-[11px] mb-1">
                      {achievement.rank}
                    </p>
                  )}
                  <h3 className="font-display text-lg font-semibold group-hover:text-cyan transition-colors">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-muted mt-1 line-clamp-2">
                    {achievement.description}
                  </p>
                  {achievement.organization && (
                    <p className="font-mono-label text-[10px] text-muted mt-2">
                      {achievement.organization}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <ButtonLink href="/achievements" variant="outline">
            FULL MISSION LOG
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
