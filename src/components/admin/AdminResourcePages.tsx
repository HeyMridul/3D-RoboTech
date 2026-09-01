import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listResource, getResourceById } from "@/server/services/admin";
import { resourceConfigs, type ResourceConfig } from "@/config/admin";
import { CrudList } from "@/components/admin/CrudList";
import { CrudEditor } from "@/components/admin/CrudEditor";
import type { AdminResource } from "@/server/services/admin";

export async function AdminResourceList({ resource }: { resource: string }) {
  const session = await auth();
  if (!session) redirect("/admin/login");
  const config = resourceConfigs[resource];
  if (!config) redirect("/admin");

  let rows: Record<string, unknown>[] = [];
  try {
    rows = (await listResource(resource as AdminResource)) as unknown as Record<
      string,
      unknown
    >[];
  } catch {
    rows = [];
  }

  return <CrudList config={config} rows={rows} />;
}

export async function AdminResourceEditor({
  resource,
  id,
}: {
  resource: string;
  id?: string;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");
  const config = resourceConfigs[resource] as ResourceConfig | undefined;
  if (!config) redirect("/admin");

  let initial: Record<string, unknown> | undefined;
  if (id) {
    try {
      initial = (await getResourceById(
        resource as AdminResource,
        id,
      )) as unknown as Record<string, unknown>;
    } catch {
      redirect(config.listHref);
    }
  }

  return <CrudEditor config={config} initial={initial} id={id} />;
}
