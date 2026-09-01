import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard — TRAIC CMS" };

async function safeCount(query: () => Promise<number>) {
  try {
    return await query();
  } catch (error) {
    console.error("[admin] count failed", error);
    return 0;
  }
}

export default async function AdminDashboard() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const [
    projects,
    drafts,
    members,
    events,
    workshops,
    achievements,
    posts,
    applications,
    messages,
  ] = await Promise.all([
    safeCount(() => prisma.project.count({ where: { deletedAt: null } })),
    safeCount(() =>
      prisma.project.count({
        where: { deletedAt: null, publishStatus: "DRAFT" },
      }),
    ),
    safeCount(() => prisma.member.count({ where: { deletedAt: null } })),
    safeCount(() => prisma.event.count({ where: { deletedAt: null } })),
    safeCount(() => prisma.workshop.count({ where: { deletedAt: null } })),
    safeCount(() => prisma.achievement.count({ where: { deletedAt: null } })),
    safeCount(() => prisma.blogPost.count({ where: { deletedAt: null } })),
    safeCount(() => prisma.application.count({ where: { status: "PENDING" } })),
    safeCount(() => prisma.contactMessage.count({ where: { read: false } })),
  ]);

  const content = [
    { label: "Projects", value: projects, href: "/admin/projects" },
    { label: "Members", value: members, href: "/admin/members" },
    { label: "Events", value: events, href: "/admin/events" },
    { label: "Workshops", value: workshops, href: "/admin/workshops" },
    { label: "Achievements", value: achievements, href: "/admin/achievements" },
    { label: "Blog posts", value: posts, href: "/admin/blog" },
  ];

  const attention = [
    {
      label: "Pending applications",
      value: applications,
      href: "/admin/applications",
    },
    { label: "Unread messages", value: messages, href: "/admin/messages" },
    { label: "Unpublished projects", value: drafts, href: "/admin/projects" },
  ];

  return (
    <div className="p-8">
      <p className="font-mono-label text-[10px] text-cyan mb-2">
        TRAIC CMS // CONTROL PANEL
      </p>
      <h1 className="font-display text-3xl font-bold mb-1">
        Welcome, {session.user.name || session.user.email}
      </h1>
      <p className="font-mono-label text-[10px] text-muted mb-10">
        ROLE: {session.user.role}
      </p>

      <section aria-labelledby="needs-attention" className="mb-10">
        <h2
          id="needs-attention"
          className="font-mono-label text-[10px] text-muted mb-3"
        >
          NEEDS ATTENTION
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {attention.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`border bg-card p-6 transition-colors ${
                item.value > 0
                  ? "border-cyan/40 hover:border-cyan"
                  : "border-card-border hover:border-metallic"
              }`}
            >
              <p className="font-mono-label text-[10px] text-muted mb-2">
                {item.label.toUpperCase()}
              </p>
              <p
                className={`font-display text-4xl font-bold ${
                  item.value > 0 ? "text-cyan" : "text-metallic"
                }`}
              >
                {item.value}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="content-library">
        <h2
          id="content-library"
          className="font-mono-label text-[10px] text-muted mb-3"
        >
          CONTENT LIBRARY
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="border border-card-border bg-card p-6 hover:border-cyan/40 transition-colors"
            >
              <p className="font-mono-label text-[10px] text-muted mb-2">
                {item.label.toUpperCase()}
              </p>
              <p className="font-display text-4xl font-bold text-foreground">
                {item.value}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
