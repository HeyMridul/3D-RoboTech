import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { MediaManager } from "@/components/admin/MediaManager";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  let media: Awaited<ReturnType<typeof prisma.media.findMany>> = [];
  try {
    media = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    // The dashboard remains navigable during initial database setup.
  }

  return (
    <div className="p-4 sm:p-8">
      <MediaManager initialItems={media} />
    </div>
  );
}
