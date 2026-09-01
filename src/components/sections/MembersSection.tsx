"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TechBadge } from "@/components/ui/TechBadge";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Member = Awaited<
  ReturnType<typeof import("@/server/services/content").getMembers>
>[number];

const categories = [
  "ALL",
  "CORE_TEAM",
  "COORDINATOR",
  "MENTOR",
  "PROJECT_LEAD",
  "MEMBER",
  "ALUMNI",
] as const;

interface MembersSectionProps {
  members: Member[];
}

export function MembersSection({ members }: MembersSectionProps) {
  const [filter, setFilter] = useState<string>("ALL");

  const filtered =
    filter === "ALL"
      ? members
      : members.filter((m) => m.category === filter);

  return (
    <section id="members" className="section-padding">
      <div className="container-traic">
        <SectionHeader
          label="MEMBER NETWORK"
          title="The Team"
          description="Engineers, developers, and innovators building TRAIC."
        />

        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={cn(
                "font-mono-label text-[10px] px-3 py-1.5 border transition-colors",
                filter === cat
                  ? "border-cyan text-cyan bg-cyan/5"
                  : "border-card-border text-muted hover:border-cyan/30",
              )}
            >
              {cat.replace("_", " ")}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="border border-card-border bg-card p-12 text-center">
            <p className="font-mono-label text-muted">NO MEMBERS FOUND</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.slice(0, 8).map((member) => (
              <Link key={member.id} href={`/members/${member.slug}`}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="group border border-card-border bg-card overflow-hidden hover:border-cyan/40 transition-colors"
                >
                  <div className="relative aspect-square bg-graphite">
                    {member.photoUrl ? (
                      <Image
                        src={member.photoUrl}
                        alt={member.name}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display text-4xl text-metallic">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent opacity-80" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-semibold group-hover:text-cyan transition-colors">
                      {member.name}
                    </h3>
                    <p className="font-mono-label text-[10px] text-muted mt-1">
                      {member.role}
                    </p>
                    {member.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {member.skills.slice(0, 3).map((skill) => (
                          <TechBadge key={skill}>{skill}</TechBadge>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <ButtonLink href="/members" variant="outline">
            ALL MEMBERS
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
