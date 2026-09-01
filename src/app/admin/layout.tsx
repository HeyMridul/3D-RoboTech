import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { adminNav } from "@/config/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-charcoal flex">
      {session && (
        <aside className="w-56 border-r border-card-border bg-card shrink-0 hidden md:flex md:flex-col">
          <div className="p-4 border-b border-card-border">
            <p className="font-mono-label text-cyan text-[10px]">TRAIC CMS</p>
            <p className="font-display font-bold">Admin</p>
            <p className="font-mono-label text-[9px] text-muted mt-1">
              {session.user.role}
            </p>
          </div>
          <nav className="p-2 flex-1 overflow-auto">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 font-mono-label text-[11px] text-muted hover:text-cyan hover:bg-cyan/5 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-card-border space-y-2">
            <Link
              href="/"
              className="block font-mono-label text-[10px] text-muted hover:text-cyan"
            >
              VIEW SITE
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button
                type="submit"
                className="font-mono-label text-[10px] text-red hover:text-red/80"
              >
                SIGN OUT
              </button>
            </form>
          </div>
        </aside>
      )}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
