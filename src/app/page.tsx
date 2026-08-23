import { Hero } from "@/components/sections/Hero";
import { WhoWeAre } from "@/components/sections/WhoWeAre";
import { WhatWeBuild } from "@/components/sections/WhatWeBuild";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { TechStack } from "@/components/sections/TechStack";
import { WorkshopsSection } from "@/components/sections/WorkshopsSection";
import { EventsSection } from "@/components/sections/EventsSection";
import { AchievementsSection } from "@/components/sections/AchievementsSection";
import { MembersSection } from "@/components/sections/MembersSection";
import { InnovationLab } from "@/components/sections/InnovationLab";
import { JoinSection } from "@/components/sections/JoinSection";
import {
  getSiteStats,
  getFeaturedProjects,
  getTechnologies,
  getWorkshops,
  getAllEvents,
  getAchievements,
  getMembers,
} from "@/server/services/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    stats,
    projects,
    technologies,
    workshops,
    events,
    achievements,
    members,
  ] = await Promise.all([
    getSiteStats(),
    getFeaturedProjects(6),
    getTechnologies(),
    getWorkshops(),
    getAllEvents(),
    getAchievements(),
    getMembers(),
  ]);

  return (
    <>
      <Hero stats={stats} />
      <WhoWeAre />
      <WhatWeBuild />
      <ProjectsSection projects={projects} />
      <TechStack technologies={technologies} />
      <WorkshopsSection workshops={workshops} />
      <EventsSection events={events} />
      <AchievementsSection achievements={achievements} />
      <MembersSection members={members} />
      <InnovationLab />
      <JoinSection />
    </>
  );
}
