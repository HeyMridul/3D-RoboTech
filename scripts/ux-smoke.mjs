/**
 * Dev-only checks for behaviour axe cannot see: reduced motion, keyboard
 * access, the command palette, and the public forms.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const results = [];
const check = (name, pass, detail = "") => {
  results.push(pass);
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
};

const browser = await chromium.launch();

/* ---- reduced motion ---------------------------------------------------- */
{
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);

  // The boot overlay must skip itself rather than animate.
  check(
    "reduced motion skips the boot sequence",
    (await page.getByText("TRAIC // SYSTEM BOOT").count()) === 0,
  );
  check(
    "content still renders with reduced motion",
    (await page.getByRole("heading", { level: 1 }).count()) > 0,
  );

  const durations = await page.evaluate(() =>
    [...document.querySelectorAll("*")]
      .slice(0, 400)
      .map((el) => getComputedStyle(el).transitionDuration)
      .filter((d) => d && d !== "0s")
      .filter((d) => parseFloat(d) > 0.02),
  );
  check(
    "transitions collapse under prefers-reduced-motion",
    durations.length === 0,
    `${durations.length} long transitions`,
  );
  await ctx.close();
}

/* ---- keyboard + command palette ---------------------------------------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(5000);

  // Skip link should be the first thing focus reaches.
  await page.keyboard.press("Tab");
  const first = await page.evaluate(() => document.activeElement?.textContent?.trim());
  check("skip link is the first tab stop", first === "Skip to content", `got "${first}"`);

  // Focus must be visible, not suppressed.
  const outline = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    const s = getComputedStyle(el);
    return { width: s.outlineWidth, style: s.outlineStyle };
  });
  check(
    "focused element has a visible outline",
    outline && outline.style !== "none" && parseFloat(outline.width) > 0,
    JSON.stringify(outline),
  );

  await page.keyboard.press("Control+k");
  await page.waitForTimeout(900);
  const paletteOpen = (await page.getByPlaceholder(/search/i).count()) > 0;
  check("Ctrl+K opens the command palette", paletteOpen);

  if (paletteOpen) {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);
    check(
      "Escape closes the command palette",
      (await page.getByPlaceholder(/search/i).count()) === 0,
    );
  }
  await ctx.close();
}

/* ---- public forms ------------------------------------------------------ */
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  // Contact form round trip
  await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
  await page.waitForTimeout(4000);
  const stamp = Date.now();
  await page.fill('input[name="name"]', "UX Smoke");
  await page.fill('input[name="email"]', `ux-${stamp}@example.com`);
  await page.fill('textarea[name="message"]', "Automated check of the contact pipeline.");
  const contactRes = page.waitForResponse(
    (r) => r.url().includes("/api/contact") && r.request().method() === "POST",
    { timeout: 15000 },
  );
  await page.click('button[type="submit"]');
  check("contact form submits successfully", (await contactRes).status() === 201 || (await contactRes).status() === 200);

  // Join application round trip
  await page.goto(`${BASE}/join`, { waitUntil: "networkidle" });
  await page.waitForTimeout(4000);
  await page.fill('input[name="name"]', "UX Smoke Applicant");
  await page.fill('input[name="email"]', `apply-${stamp}@example.com`);
  await page.fill('input[name="year"]', "2nd Year");
  await page.fill('input[name="branch"]', "ECE");
  await page.fill('textarea[name="message"]', "I would like to build autonomous systems with TRAIC.");
  const firstInterest = page.locator('input[type="checkbox"]').first();
  if (await firstInterest.count()) await firstInterest.check();
  const applyRes = page.waitForResponse(
    (r) => r.url().includes("/api/applications") && r.request().method() === "POST",
    { timeout: 15000 },
  );
  await page.click('button[type="submit"]');
  const status = (await applyRes).status();
  check("join application submits successfully", status === 201 || status === 200, `status ${status}`);

  await ctx.close();
}

await browser.close();

const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
