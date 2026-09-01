/**
 * Dev-only check of the project component viewer: confirms the model loads,
 * parts are listed, selection highlights, and the exploded view moves geometry.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

/*
 * Defaults to the production server. React Strict Mode double-mounts effects
 * in `next dev`, and R3F disposes the first renderer with forceContextLoss();
 * a canvas whose context was force-lost cannot obtain a new one, so the
 * viewer legitimately reports a lost context in development only.
 * Run `npm run build && PORT=3100 npm start` first, or set BASE_URL.
 */
const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const URL = `${BASE}/projects/autonomous-agricultural-rover`;
mkdirSync("/tmp/shots", { recursive: true });

const results = [];
const check = (name, pass, detail = "") => {
  results.push(pass);
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(5000);

const partButtons = page.locator('button[aria-pressed]');
const partCount = await partButtons.count();
check("component list rendered from the model", partCount >= 14, `${partCount} buttons`);

check(
  "viewer heading present",
  (await page.getByText("COMPONENT VIEWER").count()) > 0,
);

// Canvas should be painted, not blank
const canvas = page.locator("canvas").first();
check("canvas mounted", (await canvas.count()) === 1);

/*
 * Capture through the page compositor with a clip rather than
 * canvas.screenshot(): reading an element screenshot off a WebGL canvas
 * returns a blank buffer unless preserveDrawingBuffer is enabled, which
 * costs performance in production for no runtime benefit.
 */
await canvas.scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
const raw = await canvas.boundingBox();
const view = page.viewportSize();
// Clamp to the viewport; a clip that runs off-screen is rejected.
const box = {
  x: Math.max(0, raw.x),
  y: Math.max(0, raw.y),
  width: Math.min(raw.width, view.width - Math.max(0, raw.x)),
  height: Math.min(raw.height, view.height - Math.max(0, raw.y)),
};
const shootCanvas = (path) => page.screenshot({ path, clip: box });

const before = await shootCanvas("/tmp/shots/model-normal.png");

// Exploded view should change what is rendered
await page.getByRole("button", { name: "EXPLODED VIEW" }).click();
await page.waitForTimeout(2500);
const after = await shootCanvas("/tmp/shots/model-exploded.png");
check(
  "exploded view changes the rendered geometry",
  Buffer.compare(before, after) !== 0,
  `${before.length} vs ${after.length} bytes`,
);
check(
  "exploded toggle reflects pressed state",
  (await page.getByRole("button", { name: "EXPLODED VIEW" }).getAttribute("aria-pressed")) === "true",
);

// Selecting a component
await page.getByRole("button", { name: "ESP32", exact: true }).click();
await page.waitForTimeout(1200);
check(
  "selecting a component shows the readout",
  (await page.getByText("SELECTED COMPONENT").count()) > 0,
);
await page.screenshot({ path: "/tmp/shots/model-selected.png" });

// A project with no model must not render the viewer at all
await page.goto(`${BASE}/projects`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const links = await page.locator('a[href^="/projects/"]').evaluateAll((els) =>
  [...new Set(els.map((e) => e.getAttribute("href")))],
);
const other = links.find((h) => h && !h.includes("autonomous-agricultural-rover"));
if (other) {
  await page.goto(`${BASE}${other}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  check(
    "project without a model shows no viewer",
    (await page.getByText("COMPONENT VIEWER").count()) === 0,
    other,
  );
}

await browser.close();

if (errors.length) {
  console.log("\nERRORS:");
  for (const e of [...new Set(errors)].slice(0, 10)) console.log("  " + e);
}

const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
