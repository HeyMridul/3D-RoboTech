import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  let settings: Awaited<ReturnType<typeof prisma.siteSetting.findMany>> = [];
  try {
    settings = await prisma.siteSetting.findMany({ orderBy: { key: "asc" } });
  } catch {
    settings = [];
  }

  return <SettingsClient settings={settings} />;
}
