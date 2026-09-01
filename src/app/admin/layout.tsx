import { auth, signOut } from "@/lib/auth";
import { AdminNav } from "./_components/AdminNav";

export const metadata = {
  title: "TRAIC CMS",
  // The CMS must never appear in search results.
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // The login page renders inside this layout too; without a session we show
  // the bare shell so it is not framed by navigation it cannot use.
  if (!session) {
    return <div className="min-h-screen bg-charcoal">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-charcoal flex flex-col md:flex-row">
      <AdminNav
        user={{
          name: session.user.name ?? session.user.email,
          role: session.user.role,
        }}
        signOutAction={async () => {
          "use server";
          await signOut({ redirectTo: "/admin/login" });
        }}
      />
      <main id="admin-main" className="flex-1 min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
