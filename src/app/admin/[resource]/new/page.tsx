import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ResourceForm } from "../../_components/ResourceForm";
import { loadOptionSets, resolveResource } from "../../_lib/load";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource: name } = await params;
  const { ui } = resolveResource(name);
  return { title: `New ${ui.singular} — TRAIC CMS` };
}

export default async function AdminResourceCreatePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const { resource: name } = await params;
  const { resource, ui } = resolveResource(name);
  const optionSets = await loadOptionSets(ui);

  // Sensible starting point: unpublished, active, open for registration.
  const defaults: Record<string, unknown> = {
    publishStatus: "DRAFT",
    active: true,
    registrationOpen: true,
  };

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

      <h1 className="font-display text-2xl font-bold mb-8">
        New {ui.singular.toLowerCase()}
      </h1>

      <ResourceForm
        resource={resource}
        ui={ui}
        initialValues={defaults}
        optionSets={optionSets}
      />
    </div>
  );
}
