import { AdminResourceList } from "@/components/admin/AdminResourcePages";

export const dynamic = "force-dynamic";

export default function Page() {
  return <AdminResourceList resource="blog" />;
}
