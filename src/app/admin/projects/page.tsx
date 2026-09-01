import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { ProjectsManager } from "@/components/admin/ProjectsManager";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type ProjectWithCategory = Prisma.ProjectGetPayload<{
  include: { category: true };
}>;

export default async function AdminProjectsPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  let projects: ProjectWithCategory[] = [];
  let categories: { id: string; name: string }[] = [];
  try {
    [projects, categories] = await Promise.all([
      prisma.project.findMany({
        where: { deletedAt: null },
        include: { category: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.category.findMany({
        select: { id: true, name: true },
        orderBy: { order: "asc" },
      }),
    ]);
  } catch {
    // The CMS remains usable during initial database setup.
  }

  return (
    <div className="p-4 sm:p-8">
      <ProjectsManager initialProjects={projects} categories={categories} />
    </div>
  );
}
