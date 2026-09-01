import { getSiteSettings } from "@/server/services/content";
import { DemoModeNotice } from "./DemoModeNotice";

/**
 * Seed content is fictional, and the spec is explicit that it must never read
 * as TRAIC's actual record. While the `demo_mode` site setting is on, every
 * public page says so. Turn it off in the CMS once real content replaces the
 * seed.
 */
export async function DemoModeBanner() {
  const settings = await getSiteSettings();
  if (settings.demo_mode !== "true") return null;
  return <DemoModeNotice />;
}
