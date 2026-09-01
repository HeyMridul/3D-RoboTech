import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { MediaClient } from "./MediaClient";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  let items: Awaited<ReturnType<typeof prisma.media.findMany>> = [];
  try {
    items = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    items = [];
  }

  return <MediaClient items={items} />;
}
