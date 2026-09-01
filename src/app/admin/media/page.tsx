import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { MediaLibrary } from "../_components/MediaLibrary";

export const dynamic = "force-dynamic";
export const metadata = { title: "Media — TRAIC CMS" };

export default async function AdminMediaPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  let media: Awaited<ReturnType<typeof prisma.media.findMany>> = [];
  try {
    media = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      take: 300,
    });
  } catch (error) {
    console.error("[admin] failed to load media", error);
  }

  return (
    <div className="p-8">
      <p className="font-mono-label text-[10px] text-cyan mb-1">TRAIC CMS</p>
      <h1 className="font-display text-2xl font-bold">Media</h1>
      <p className="text-sm text-muted mt-1 mb-8">
        Images and 3D models uploaded for projects, members and events.
      </p>

      <MediaLibrary
        items={media.map((m) => ({
          id: m.id,
          url: m.url,
          filename: m.filename,
          mimeType: m.mimeType,
          size: m.size,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
