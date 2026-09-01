import { AdminResourceEditor } from "@/components/admin/AdminResourcePages";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminResourceEditor resource="members" id={id} />;
}
