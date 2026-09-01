import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { UsersManager } from "@/components/admin/UsersManager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");
  if (session.user.role !== "ADMIN") redirect("/admin");

  let users: Awaited<ReturnType<typeof prisma.user.findMany>> = [];
  try {
    users = await prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // Initial database setup state.
  }

  return (
    <div className="p-4 sm:p-8">
      <UsersManager
        initialUsers={users.map(({ id, email, name, role }) => ({
          id,
          email,
          name,
          role,
        }))}
      />
    </div>
  );
}
