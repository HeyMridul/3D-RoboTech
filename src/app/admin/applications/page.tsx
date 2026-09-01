import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  let applications: Awaited<ReturnType<typeof prisma.application.findMany>> = [];
  try {
    applications = await prisma.application.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch {
    /* db unavailable */
  }

  return (
    <div className="p-8">
      <p className="font-mono-label text-cyan mb-1">CMS</p>
      <h1 className="font-display text-2xl font-bold mb-8">Applications</h1>

      {applications.length === 0 ? (
        <p className="font-mono-label text-muted">No applications yet.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="border border-card-border bg-card p-6"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">{app.name}</h3>
                  <p className="text-sm text-muted">{app.email}</p>
                </div>
                <span className="font-mono-label text-[10px] text-cyan">
                  {app.status}
                </span>
              </div>
              <p className="font-mono-label text-[10px] text-muted mb-2">
                {app.year}{" // "}{app.branch}
              </p>
              <p className="text-sm text-muted mb-3">{app.message}</p>
              <div className="flex flex-wrap gap-1">
                {app.interests.map((i) => (
                  <span
                    key={i}
                    className="font-mono-label text-[9px] px-2 py-0.5 border border-card-border text-muted"
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
