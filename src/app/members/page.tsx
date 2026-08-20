import { SectionHeader } from "@/components/ui/SectionHeader";
import { getMembers } from "@/server/services/content";
import Link from "next/link";
import Image from "next/image";
import { TechBadge } from "@/components/ui/TechBadge";

export const metadata = { title: "Members" };
export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const members = await getMembers();

  return (
    <div className="pt-24 section-padding min-h-screen">
      <div className="container-traic">
        <SectionHeader
          label="MEMBER NETWORK"
          title="Team & Community"
          description="Meet the engineers, developers, and innovators behind TRAIC."
        />

        {members.length === 0 ? (
          <div className="border border-card-border bg-card p-16 text-center">
            <p className="font-mono-label text-muted">NO MEMBERS FOUND</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {members.map((member) => (
              <Link
                key={member.id}
                href={`/members/${member.slug}`}
                className="group border border-card-border bg-card overflow-hidden hover:border-cyan/40 transition-colors"
              >
                <div className="relative aspect-square bg-graphite">
                  {member.photoUrl ? (
                    <Image
                      src={member.photoUrl}
                      alt={member.name}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 transition-all"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display text-5xl text-metallic">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-display font-semibold group-hover:text-cyan transition-colors">
                    {member.name}
                  </h3>
                  <p className="font-mono-label text-[10px] text-muted mt-1">
                    {member.role} // {member.category.replace("_", " ")}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {member.skills.slice(0, 4).map((s) => (
                      <TechBadge key={s}>{s}</TechBadge>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
