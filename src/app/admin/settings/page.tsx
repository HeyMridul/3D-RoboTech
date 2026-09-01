import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { siteSettingSchema } from "@/lib/validation/schemas";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings — TRAIC CMS" };

/**
 * Settings the site reads at render time. Kept as key/value rows so a new
 * toggle does not require a migration.
 */
const KNOWN_SETTINGS = [
  {
    key: "demo_mode",
    label: "Demo mode",
    help: "Shows the 'demo content' notice on public pages. Turn this off once real TRAIC data replaces the seed.",
  },
  {
    key: "contact_email",
    label: "Contact email",
    help: "Shown on the contact page.",
  },
  {
    key: "join_open",
    label: "Recruitment open",
    help: "Set to false to close the membership application form.",
  },
] as const;

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  // Only administrators change site-wide configuration.
  if (session.user.role !== "ADMIN") {
    return (
      <div className="p-8">
        <h1 className="font-display text-2xl font-bold mb-2">Settings</h1>
        <p
          role="alert"
          className="border border-orange/40 bg-orange/5 px-4 py-3 font-mono-label text-[11px] text-orange"
        >
          ADMINISTRATOR ACCESS REQUIRED
        </p>
      </div>
    );
  }

  let existing: Record<string, string> = {};
  try {
    const rows = await prisma.siteSetting.findMany();
    existing = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch (error) {
    console.error("[admin] failed to load settings", error);
  }

  async function save(formData: FormData) {
    "use server";

    const current = await auth();
    if (current?.user.role !== "ADMIN") {
      throw new Error("Administrator access required.");
    }

    for (const { key } of KNOWN_SETTINGS) {
      const raw = formData.get(key);
      if (typeof raw !== "string") continue;
      const parsed = siteSettingSchema.parse({ key, value: raw });
      await prisma.siteSetting.upsert({
        where: { key: parsed.key },
        create: parsed,
        update: { value: parsed.value },
      });
    }

    revalidatePath("/admin/settings");
    revalidatePath("/");
  }

  return (
    <div className="p-8">
      <p className="font-mono-label text-[10px] text-cyan mb-1">TRAIC CMS</p>
      <h1 className="font-display text-2xl font-bold">Settings</h1>
      <p className="text-sm text-muted mt-1 mb-8">
        Site-wide configuration. Changes take effect immediately.
      </p>

      <form action={save} className="max-w-2xl space-y-6">
        <div className="border border-card-border bg-card divide-y divide-card-border">
          {KNOWN_SETTINGS.map((setting) => (
            <div key={setting.key} className="p-6">
              <label
                htmlFor={setting.key}
                className="block font-mono-label text-[10px] text-muted mb-2"
              >
                {setting.label}
              </label>
              <input
                id={setting.key}
                name={setting.key}
                defaultValue={existing[setting.key] ?? ""}
                className="w-full bg-charcoal border border-card-border px-3 py-2 text-sm focus:border-cyan focus:outline-none"
              />
              <p className="mt-1.5 text-[11px] text-muted">{setting.help}</p>
            </div>
          ))}
        </div>

        <Button type="submit" withArrow={false}>
          SAVE SETTINGS
        </Button>
      </form>
    </div>
  );
}
