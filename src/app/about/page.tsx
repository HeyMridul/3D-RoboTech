import { WhoWeAre } from "@/components/sections/WhoWeAre";
import { WhatWeBuild } from "@/components/sections/WhatWeBuild";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { siteConfig } from "@/config/site";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <div className="pt-32 section-padding">
        <div className="container-traic">
          <SectionHeader
            label="TRAIC // SYSTEM ONLINE"
            title="About TRAIC"
            description="The Robotics & Innovation Club — a community of builders turning ideas into real-world technology."
          />
          <div className="max-w-3xl space-y-6 text-muted leading-relaxed">
            <p>
              TRAIC is the robotics, technology, and innovation club of our
              university. We bring together engineers, developers, and
              innovators who share a passion for building real things — from
              autonomous robots and drones to AI systems and full-stack
              applications.
            </p>
            <p>
              Our mission is simple: <strong className="text-foreground">BUILD. EXPERIMENT. INNOVATE. DEPLOY.</strong>
            </p>
            <div className="font-mono-label text-[11px] text-muted border border-card-border bg-card p-4 space-y-1">
              <p>LOCATION: {siteConfig.location.name}</p>
              <p>
                {`COORDINATES: LAT ${siteConfig.location.lat} // LON ${siteConfig.location.lon}`}
              </p>
              <p>STATUS: OPERATIONAL</p>
            </div>
          </div>
        </div>
      </div>
      <WhoWeAre />
      <WhatWeBuild />
    </>
  );
}
