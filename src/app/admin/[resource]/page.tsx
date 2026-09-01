import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ResourceTable } from "../_components/ResourceTable";
import { loadRows, resolveResource } from "../_lib/load";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource: name } = await params;
  const { ui } = resolveResource(name);
  return { title: `${ui.title} — TRAIC CMS` };
}

export default async function AdminResourceListPage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const { resource: name } = await params;
  const { resource, ui } = resolveResource(name);
  const rows = await loadRows(resource);

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="font-mono-label text-[10px] text-cyan mb-1">TRAIC CMS</p>
          <h1 className="font-display text-2xl font-bold">{ui.title}</h1>
          <p className="text-sm text-muted mt-1">{ui.description}</p>
        </div>
        <Link
          href={`/admin/${resource}/new`}
          className="font-mono-label text-[11px] px-4 py-2 border border-cyan text-cyan hover:bg-cyan/10 transition-colors"
        >
          + NEW {ui.singular.toUpperCase()}
        </Link>
      </div>

      <ResourceTable resource={resource} ui={ui} rows={rows} />
    </div>
  );
}
