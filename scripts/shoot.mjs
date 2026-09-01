// Dev-only screenshot helper: node scripts/shoot.mjs <path> <outName> [width] [fullPage]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [, , route = "/", name = "shot", width = "1440", full = "true"] =
  process.argv;

mkdirSync("/tmp/shots", { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(width), height: 900 },
  deviceScaleFactor: 1,
});

const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(`PAGEERROR: ${e.message}`));

await page.goto(`http://localhost:3000${route}`, {
  waitUntil: "networkidle",
  timeout: 60000,
});
// Let the boot sequence and 3D scene settle
await page.waitForTimeout(6000);

await page.screenshot({
  path: `/tmp/shots/${name}.png`,
  fullPage: full === "true",
});

console.log(`saved /tmp/shots/${name}.png`);
if (errors.length) console.log("CONSOLE ERRORS:\n" + errors.join("\n"));

await browser.close();
