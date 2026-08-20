import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

async function safeCount(model: () => Promise<number>) {
  try {
    return await model();
  } catch {
    return 0;
  }
}

export default async function AdminDashboard() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const [projects, members, events, workshops, applications, messages] =
    await Promise.all([
      safeCount(() => prisma.project.count({ where: { deletedAt: null } })),
      safeCount(() => prisma.member.count({ where: { deletedAt: null } })),
      safeCount(() => prisma.event.count({ where: { deletedAt: null } })),
      safeCount(() => prisma.workshop.count({ where: { deletedAt: null } })),
      safeCount(() =>
        prisma.application.count({ where: { status: "PENDING" } }),
      ),
      safeCount(() => prisma.contactMessage.count({ where: { read: false } })),
    ]);

  const stats = [
    { label: "Projects", value: projects, href: "/admin/projects" },
    { label: "Members", value: members, href: "/admin/members" },
    { label: "Events", value: events, href: "/admin/events" },
    { label: "Workshops", value: workshops, href: "/admin/workshops" },
    { label: "Pending Applications", value: applications, href: "/admin/applications" },
    { label: "Unread Messages", value: messages, href: "/admin/messages" },
  ];

  return (
    <div className="p-8">
      <p className="font-mono-label text-cyan mb-2">ADMIN DASHBOARD</p>
      <h1 className="font-display text-3xl font-bold mb-2">
        Welcome, {session.user.name || session.user.email}
      </h1>
      <p className="font-mono-label text-[10px] text-muted mb-8">
        ROLE: {session.user.role}
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="border border-card-border bg-card p-6 hover:border-cyan/40 transition-colors"
          >
            <p className="font-mono-label text-[10px] text-muted mb-2">
              {stat.label.toUpperCase()}
            </p>
            <p className="font-display text-4xl font-bold text-cyan">
              {stat.value}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
