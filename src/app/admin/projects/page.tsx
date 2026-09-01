import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { TechBadge } from "@/components/ui/TechBadge";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type ProjectWithCategory = Prisma.ProjectGetPayload<{
  include: { category: true };
}>;

export default async function AdminProjectsPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  let projects: ProjectWithCategory[] = [];
  try {
    projects = await prisma.project.findMany({
      where: { deletedAt: null },
      include: { category: true },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    /* db unavailable */
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono-label text-cyan mb-1">CMS</p>
          <h1 className="font-display text-2xl font-bold">Projects</h1>
        </div>
        <Link
          href="/admin/projects/new"
          className="font-mono-label text-[11px] px-4 py-2 border border-cyan text-cyan hover:bg-cyan/10"
        >
          + NEW PROJECT
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="font-mono-label text-muted">No projects. Run seed or create one.</p>
      ) : (
        <div className="border border-card-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-graphite font-mono-label text-[10px] text-muted">
              <tr>
                <th className="text-left p-3">TITLE</th>
                <th className="text-left p-3">CATEGORY</th>
                <th className="text-left p-3">STATUS</th>
                <th className="text-left p-3">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-t border-card-border">
                  <td className="p-3">{p.title}</td>
                  <td className="p-3">
                    {p.category ? (
                      <TechBadge>{p.category.name}</TechBadge>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3">
                    <TechBadge
                      variant={
                        p.publishStatus === "PUBLISHED" ? "green" : "default"
                      }
                    >
                      {p.publishStatus}
                    </TechBadge>
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/admin/projects/${p.id}`}
                      className="text-cyan hover:underline font-mono-label text-[10px]"
                    >
                      EDIT
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
