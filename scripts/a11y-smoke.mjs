/**
 * Dev-only accessibility sweep with axe-core across the public routes.
 * Usage: BASE_URL=http://localhost:3100 node scripts/a11y-smoke.mjs
 */
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const ROUTES = [
  "/",
  "/about",
  "/projects",
  "/projects/autonomous-agricultural-rover",
  "/members",
  "/events",
  "/workshops",
  "/achievements",
  "/gallery",
  "/blog",
  "/lab",
  "/join",
  "/contact",
  "/admin/login",
];

const browser = await chromium.launch();
// axe requires an explicit context rather than the implicit one newPage makes
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

let total = 0;
const byRule = new Map();

for (const route of ROUTES) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  // Let the boot overlay dismiss and the 3D settle before scanning.
  await page.waitForTimeout(4500);

  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  total += violations.length;
  const summary = violations
    .map((v) => `${v.id}(${v.impact},${v.nodes.length})`)
    .join(" ");
  console.log(
    `${violations.length === 0 ? "PASS" : "FAIL"}  ${route}${summary ? "  — " + summary : ""}`,
  );

  for (const v of violations) {
    const entry = byRule.get(v.id) ?? { impact: v.impact, count: 0, help: v.help, sample: "" };
    entry.count += v.nodes.length;
    if (!entry.sample) entry.sample = v.nodes[0]?.html?.slice(0, 140) ?? "";
    byRule.set(v.id, entry);
  }
}

await browser.close();

if (byRule.size) {
  console.log("\nVIOLATIONS BY RULE");
  for (const [id, e] of [...byRule].sort((a, b) => b[1].count - a[1].count)) {
    console.log(`  ${id} [${e.impact}] x${e.count} — ${e.help}`);
    console.log(`    e.g. ${e.sample}`);
  }
}

console.log(`\n${total} violation groups across ${ROUTES.length} routes`);
process.exit(total ? 1 : 0);
