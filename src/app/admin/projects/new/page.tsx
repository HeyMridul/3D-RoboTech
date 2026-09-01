import { AdminResourceEditor } from "@/components/admin/AdminResourcePages";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  return <AdminResourceEditor resource="projects" />;
}
