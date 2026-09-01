import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { GalleryClient } from "./GalleryClient";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  let items: Awaited<ReturnType<typeof prisma.galleryItem.findMany>> = [];
  try {
    items = await prisma.galleryItem.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    items = [];
  }

  return <GalleryClient items={items} />;
}
