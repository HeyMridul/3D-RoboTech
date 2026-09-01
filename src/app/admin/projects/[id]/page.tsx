import { AdminResourceEditor } from "@/components/admin/AdminResourcePages";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminResourceEditor resource="projects" id={id} />;
}
