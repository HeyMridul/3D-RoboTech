import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Members", href: "/admin/members" },
  { label: "Events", href: "/admin/events" },
  { label: "Workshops", href: "/admin/workshops" },
  { label: "Achievements", href: "/admin/achievements" },
  { label: "Applications", href: "/admin/applications" },
  { label: "Messages", href: "/admin/messages" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Allow login page without auth
  // This is handled by checking pathname in a client wrapper or separate layout
  // For simplicity, login page is outside this layout

  return (
    <div className="min-h-screen bg-charcoal flex">
      {session && (
        <aside className="w-56 border-r border-card-border bg-card shrink-0 hidden md:block">
          <div className="p-4 border-b border-card-border">
            <p className="font-mono-label text-cyan text-[10px]">TRAIC CMS</p>
            <p className="font-display font-bold">Admin</p>
          </div>
          <nav className="p-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 font-mono-label text-[11px] text-muted hover:text-cyan hover:bg-cyan/5 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
            className="p-4 border-t border-card-border mt-auto"
          >
            <button
              type="submit"
              className="font-mono-label text-[10px] text-red hover:text-red/80"
            >
              SIGN OUT
            </button>
          </form>
        </aside>
      )}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
