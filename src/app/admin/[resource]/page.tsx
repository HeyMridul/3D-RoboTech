import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ResourceManager } from "@/components/admin/ResourceManager";
import {
  isManagedResource,
  listManagedResource,
} from "@/server/services/admin-content";

export const dynamic = "force-dynamic";

export default async function ManagedResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const { resource } = await params;
  if (!isManagedResource(resource)) notFound();

  let items: Awaited<ReturnType<typeof listManagedResource>> = [];
  try {
    items = await listManagedResource(resource);
  } catch {
    // Keep the dashboard usable when a development database is offline.
  }

  return (
    <div className="p-4 sm:p-8">
      <ResourceManager resource={resource} initialItems={items} />
    </div>
  );
}
