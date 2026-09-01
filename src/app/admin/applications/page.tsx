import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import { ApplicationActions } from "../_components/InboxActions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Applications — TRAIC CMS" };

export default async function AdminApplicationsPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  let applications: Awaited<ReturnType<typeof prisma.application.findMany>> = [];
  try {
    applications = await prisma.application.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });
  } catch (error) {
    console.error("[admin] failed to load applications", error);
  }

  const pending = applications.filter((a) => a.status === "PENDING").length;

  return (
    <div className="p-8">
      <p className="font-mono-label text-[10px] text-cyan mb-1">TRAIC CMS</p>
      <h1 className="font-display text-2xl font-bold">Applications</h1>
      <p className="text-sm text-muted mt-1 mb-8">
        {applications.length} total // {pending} awaiting review
      </p>

      {applications.length === 0 ? (
        <div className="border border-dashed border-card-border p-12 text-center">
          <p className="font-mono-label text-[11px] text-muted mb-2">
            NO APPLICATIONS YET
          </p>
          <p className="text-sm text-muted">
            Submissions from the join form will appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {applications.map((app) => (
            <li key={app.id} className="border border-card-border bg-card p-6">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <h2 className="font-semibold">{app.name}</h2>
                  <a
                    href={`mailto:${app.email}`}
                    className="text-sm text-muted hover:text-cyan"
                  >
                    {app.email}
                  </a>
                  <p className="font-mono-label text-[10px] text-muted mt-1">
                    {app.year} // {app.branch} // {formatDate(app.createdAt)}
                  </p>
                </div>
                <ApplicationActions id={app.id} status={app.status} />
              </div>

              <p className="text-sm text-metallic mb-4 whitespace-pre-line">
                {app.message}
              </p>

              {app.interests.length > 0 && (
                <div className="mb-2">
                  <p className="font-mono-label text-[9px] text-muted mb-1">
                    INTERESTS
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {app.interests.map((i) => (
                      <span
                        key={i}
                        className="font-mono-label text-[9px] px-2 py-0.5 border border-card-border text-metallic"
                      >
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {app.skills.length > 0 && (
                <div className="mb-2">
                  <p className="font-mono-label text-[9px] text-muted mb-1">
                    SKILLS
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {app.skills.map((s) => (
                      <span
                        key={s}
                        className="font-mono-label text-[9px] px-2 py-0.5 border border-card-border text-metallic"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-3 font-mono-label text-[10px]">
                {app.githubUrl && (
                  <a
                    href={app.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan hover:underline"
                  >
                    GITHUB ↗
                  </a>
                )}
                {app.linkedinUrl && (
                  <a
                    href={app.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan hover:underline"
                  >
                    LINKEDIN ↗
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
