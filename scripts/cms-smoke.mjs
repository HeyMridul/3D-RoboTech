/**
 * Dev-only browser walkthrough of the CMS: signs in through the real login
 * form, visits every admin section, then creates and deletes a record using
 * the actual form UI.
 * Usage: node scripts/cms-smoke.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3000";
const SECTIONS = [
  "/admin",
  "/admin/projects",
  "/admin/members",
  "/admin/events",
  "/admin/workshops",
  "/admin/achievements",
  "/admin/blog",
  "/admin/gallery",
  "/admin/technologies",
  "/admin/categories",
  "/admin/media",
  "/admin/applications",
  "/admin/messages",
  "/admin/settings",
];

mkdirSync("/tmp/shots", { recursive: true });

const results = [];
const consoleErrors = [];
function check(name, pass, detail = "") {
  results.push({ name, pass });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text());
});
page.on("pageerror", (e) => consoleErrors.push(`PAGEERROR: ${e.message}`));

// ---- admin is gated ------------------------------------------------------
await page.goto(`${BASE}/admin/projects`, { waitUntil: "networkidle" });
check(
  "unauthenticated /admin/projects redirects to login",
  page.url().includes("/admin/login"),
  page.url(),
);

// ---- sign in through the real form ---------------------------------------
await page.fill('input[name="email"], input[type="email"]', "admin@traic.dev");
await page.fill('input[name="password"], input[type="password"]', "TraicAdmin2026!");
await Promise.all([
  page.waitForURL((u) => !u.pathname.includes("/admin/login"), { timeout: 30000 }),
  page.click('button[type="submit"]'),
]);
check("sign-in navigates into the CMS", !page.url().includes("/admin/login"), page.url());

// ---- every section renders ------------------------------------------------
for (const path of SECTIONS) {
  const res = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  const status = res?.status() ?? 0;
  const heading = await page.locator("h1").first().textContent().catch(() => null);
  const has404 = (await page.locator("text=404").count()) > 0;
  check(
    `${path} renders`,
    status === 200 && !has404 && Boolean(heading),
    `status=${status} h1="${heading?.trim()}"`,
  );
}

await page.goto(`${BASE}/admin/projects`, { waitUntil: "networkidle" });
await page.screenshot({ path: "/tmp/shots/admin-projects.png", fullPage: false });

// ---- create a workshop through the form ----------------------------------
const title = `Playwright Test Workshop ${Date.now()}`;
await page.goto(`${BASE}/admin/workshops/new`, { waitUntil: "networkidle" });
await page.screenshot({ path: "/tmp/shots/admin-form.png", fullPage: false });

await page.fill("#field-title", title);
await page.fill("#field-instructor", "Automated Check");
await page.selectOption("#field-track", "Robotics");
await page.selectOption("#field-level", "BEGINNER");
await page.fill("#field-description", "Created by the CMS smoke test to verify the write path.");
await page.selectOption("#field-publishStatus", "PUBLISHED");

await Promise.all([
  page.waitForURL("**/admin/workshops", { timeout: 30000 }),
  page.click('button[type="submit"]:has-text("CREATE")'),
]);
check(
  "created workshop appears in the list",
  (await page.locator("tr", { hasText: title }).count()) === 1,
);

// ---- it reached the public site ------------------------------------------
await page.goto(`${BASE}/workshops`, { waitUntil: "networkidle" });
check(
  "published workshop is visible on the public page",
  (await page.getByText(title, { exact: false }).count()) > 0,
);

// ---- edit it --------------------------------------------------------------
await page.goto(`${BASE}/admin/workshops`, { waitUntil: "networkidle" });
await page.click(`text=${title}`);
await page.waitForLoadState("networkidle");
await page.fill("#field-instructor", "Edited By Test");
await Promise.all([
  page.waitForURL("**/admin/workshops", { timeout: 30000 }),
  page.click('button[type="submit"]:has-text("SAVE")'),
]);
check(
  "edit persists",
  (await page.locator("tr", { hasText: "Edited By Test" }).count()) > 0,
);

// ---- delete it ------------------------------------------------------------
// Let the edit's router.refresh() settle first, otherwise its response can
// land after the delete and repaint the row we just removed.
await page.waitForLoadState("networkidle");
page.once("dialog", (d) => d.accept());
const row = page.locator("tr", { hasText: title });
const deleted = page
  .waitForResponse(
    (r) =>
      r.url().includes("/api/admin/workshops/") &&
      r.request().method() === "DELETE",
    { timeout: 15000 },
  )
  .catch(() => null);
await row.locator('button:has-text("DELETE")').click();
await deleted;
await page.waitForTimeout(3000);
// Count table rows rather than body text: body.textContent() also picks up
// Next's RSC flight payload inside <script>, which still names the record.
check(
  "delete removes it from the list",
  (await page.locator("tr", { hasText: title }).count()) === 0,
);

// ---- soft delete hides it publicly ---------------------------------------
await page.goto(`${BASE}/workshops`, { waitUntil: "networkidle" });
check(
  "deleted workshop no longer public",
  (await page.getByText(title, { exact: false }).count()) === 0,
);

await browser.close();

if (consoleErrors.length) {
  console.log("\nCONSOLE ERRORS:");
  for (const e of [...new Set(consoleErrors)].slice(0, 15)) console.log(`  ${e}`);
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
