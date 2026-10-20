/**
 * Render check for the built output: desktop and mobile, per route.
 *
 * Reports visible content, horizontal overflow, console errors and the page
 * ground colour, and writes a screenshot per case. Run against whatever is
 * serving the build: `node scripts/render-check.mjs http://127.0.0.1:8081/`
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const base = (process.argv[2] || "http://127.0.0.1:8081/").replace(/\/$/, "");
const routes = ["/", "/login", "/code-of-conduct", "/data-protection", "/cookie-information"];
const outDir = new URL("../screenshots/render-check/", import.meta.url).pathname;
mkdirSync(outDir, { recursive: true });

// 390×844 is the phone width the layout is judged at. A viewport, not a Playwright
// device descriptor, so the cached headless shell — which has no touch model —
// still gives a faithful result.
const cases = [
  { name: "desktop", ctx: { viewport: { width: 1440, height: 900 } } },
  { name: "mobile", ctx: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 } },
];

// Set CHROME_PATH to point at an already-downloaded shell when this checkout's
// matching Playwright build is not installed.
const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
);
const rows = [];

for (const c of cases) {
  const ctx = await browser.newContext(c.ctx);
  for (const route of routes) {
    const page = await ctx.newPage();
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));
    page.on("pageerror", (e) => errors.push(`pageerror: ${String(e).slice(0, 160)}`));
    page.on("response", (r) => {
      if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`);
    });
    try {
      await page.goto(base + route, { waitUntil: "networkidle", timeout: 30000 });
    } catch (e) {
      rows.push({ c: c.name, route, text: 0, overflow: 0, bg: "-", err: `NAVFAIL ${e}` });
      await page.close();
      continue;
    }
    await page.waitForTimeout(700);
    const probe = await page.evaluate(() => {
      const main = document.querySelector("main") || document.body;
      const style = getComputedStyle(document.body);
      return {
        chars: (main.innerText || "").trim().length,
        headings: main.querySelectorAll("h1,h2").length,
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        bg: style.backgroundColor,
        guestBtn: [...document.querySelectorAll("button,a")].some((el) =>
          /guest/i.test(el.textContent || ""),
        ),
      };
    });
    const file = `${outDir}${probe.chars ? "ok" : "BLANK"}-${c.name}${route.replace(/\//g, "_")}.png`;
    await page.screenshot({ path: file, fullPage: false });
    rows.push({ ...probe, c: c.name, route, err: errors.slice(0, 3).join(" | ") || "none" });
    await page.close();
  }
  await ctx.close();
}
await browser.close();

console.table(rows);
