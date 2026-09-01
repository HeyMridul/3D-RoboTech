import { AdminResourceList } from "@/components/admin/AdminResourcePages";

export const dynamic = "force-dynamic";

export default function AdminProjectsPage() {
  return <AdminResourceList resource="projects" />;
}
