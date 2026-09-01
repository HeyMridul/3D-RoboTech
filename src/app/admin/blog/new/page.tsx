import { AdminResourceEditor } from "@/components/admin/AdminResourcePages";

export const dynamic = "force-dynamic";

export default function Page() {
  return <AdminResourceEditor resource="blog" />;
}
