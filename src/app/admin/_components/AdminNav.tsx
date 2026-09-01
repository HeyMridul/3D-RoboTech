"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "../_config/resource-ui";

interface AdminNavProps {
  user: { name: string; role: string };
  signOutAction: () => Promise<void>;
}

export function AdminNav({ user, signOutAction }: AdminNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const nav = (
    <nav aria-label="CMS sections" className="p-2">
      {ADMIN_NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          aria-current={isActive(item.href) ? "page" : undefined}
          className={cn(
            "block px-3 py-2 font-mono-label text-[11px] transition-colors border-l-2",
            isActive(item.href)
              ? "text-cyan border-cyan bg-cyan/5"
              : "text-muted border-transparent hover:text-foreground hover:bg-cyan/5",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile bar */}
      <div className="md:hidden flex items-center justify-between border-b border-card-border bg-card px-4 py-3">
        <div>
          <p className="font-mono-label text-[10px] text-cyan">TRAIC CMS</p>
          <p className="font-display font-bold text-sm">{user.name}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="admin-nav-mobile"
          className="p-2 text-muted hover:text-cyan"
        >
          <span className="sr-only">
            {open ? "Close menu" : "Open menu"}
          </span>
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      {open && (
        <div
          id="admin-nav-mobile"
          className="md:hidden border-b border-card-border bg-card"
        >
          {nav}
          <SignOut action={signOutAction} />
        </div>
      )}

      {/* Desktop rail */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-card-border bg-card">
        <div className="p-4 border-b border-card-border">
          <Link href="/" className="block group">
            <p className="font-mono-label text-[10px] text-cyan">TRAIC CMS</p>
            <p className="font-display font-bold group-hover:text-cyan transition-colors">
              Control Panel
            </p>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        <div className="border-t border-card-border p-4">
          <p className="font-mono-label text-[10px] text-muted truncate">
            {user.name}
          </p>
          <p className="font-mono-label text-[9px] text-cyan mb-3">
            ROLE: {user.role}
          </p>
          <SignOut action={signOutAction} />
        </div>
      </aside>
    </>
  );
}

function SignOut({ action }: { action: () => Promise<void> }) {
  return (
    <form action={action} className="p-4 md:p-0">
      <button
        type="submit"
        className="font-mono-label text-[10px] text-red hover:text-red/80"
      >
        SIGN OUT
      </button>
    </form>
  );
}
