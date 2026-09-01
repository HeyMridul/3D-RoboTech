import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ResourceForm } from "../../_components/ResourceForm";
import {
  loadOptionSets,
  loadRecord,
  resolveResource,
  toFormValues,
} from "../../_lib/load";

export const dynamic = "force-dynamic";

type Params = Promise<{ resource: string; id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { resource: name } = await params;
  const { ui } = resolveResource(name);
  return { title: `Edit ${ui.singular} — TRAIC CMS` };
}

export default async function AdminResourceEditPage({
  params,
}: {
  params: Params;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const { resource: name, id } = await params;
  const { resource, ui } = resolveResource(name);

  const [record, optionSets] = await Promise.all([
    loadRecord(resource, id),
    loadOptionSets(ui),
  ]);

  const heading = String(record[ui.titleField] ?? ui.singular);
  const slug = typeof record.slug === "string" ? record.slug : null;
  const publicHref =
    ui.publicPath && slug ? ui.publicPath.replace(":slug", slug) : null;

  return (
    <div className="p-8">
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          href={`/admin/${resource}`}
          className="font-mono-label text-[10px] text-muted hover:text-cyan"
        >
          ← {ui.title.toUpperCase()}
        </Link>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="font-mono-label text-[10px] text-cyan mb-1">
            EDIT {ui.singular.toUpperCase()}
          </p>
          <h1 className="font-display text-2xl font-bold">{heading}</h1>
        </div>
        {publicHref && record.publishStatus === "PUBLISHED" && (
          <Link
            href={publicHref}
            target="_blank"
            className="font-mono-label text-[10px] text-muted hover:text-cyan"
          >
            VIEW LIVE ↗
          </Link>
        )}
      </div>

      <ResourceForm
        resource={resource}
        ui={ui}
        recordId={id}
        initialValues={toFormValues(record)}
        optionSets={optionSets}
      />
    </div>
  );
}
