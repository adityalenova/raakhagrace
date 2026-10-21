/**
 * Does the mail outbox log actually work?
 *
 * The point of `mail_log` is that a refused send stops being invisible, so this
 * checks the refusal path specifically — with a deliberately invalid Resend key.
 * The key is non-empty, which is all `resendConfigured()` looks at, so the app
 * really calls the mail service; the service rejects it; nothing is mailed to
 * anybody. The row that comes out the other side is the thing under test.
 *
 *   DATABASE_URL=" " BETTER_AUTH_URL="http://127.0.0.1:8091" \
 *   RESEND_API_KEY=not-a-real-key RESEND_FROM="Raakha Grace <onboarding@resend.dev>" \
 *   ADMIN_EMAILS=mail-log@example.com \
 *     node scripts/with-app-env.mjs vite dev --host 127.0.0.1 --port 8091
 *
 * Usage: node scripts/mail-log-check.mjs [base] [email]
 * The email must be the address in ADMIN_EMAILS — the outbox is admin-only.
 */
import { chromium } from "playwright";

const base = (process.argv[2] || "http://127.0.0.1:8091").replace(/\/$/, "");
const email = process.argv[3] || "mail-log@example.com";
const pw = (s) => base + s;
const shots = new URL("../screenshots/mail-log/", import.meta.url).pathname;
const { mkdirSync } = await import("node:fs");
mkdirSync(shots, { recursive: true });

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
);
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${String(e).slice(0, 200)}`));
page.on(
  "console",
  (m) => m.type() === "error" && errors.push(`console: ${m.text().slice(0, 200)}`),
);
page.on("response", (r) => {
  if (!r.url().includes("/api/auth/")) return;
  console.log(`  -> ${r.status()} ${new URL(r.url()).pathname}`);
});

/** Vite compiles on first hit, so a page can sit un-hydrated and swallow clicks. */
async function hydrated(p, timeoutMs = 60000) {
  const start = Date.now();
  for (;;) {
    const ready = await p
      .evaluate(() =>
        Object.keys(document.body || {}).some(
          (k) => k.startsWith("__reactFiber$") || k.startsWith("__reactContainer$"),
        ),
      )
      .catch(() => false);
    if (ready) return;
    if (Date.now() - start > timeoutMs) throw new Error("page never hydrated");
    await new Promise((r) => setTimeout(r, 300));
  }
}

console.log("\n[1. sign up — this attempts a welcome mail and a code mail]");
await page.goto(pw("/login"), { waitUntil: "load" });
await hydrated(page);
await page.getByText("Need an account? Create one").click();
await page.getByPlaceholder("Your name").fill("Mail Log Probe");
await page.getByPlaceholder("Email address").fill(email);
await page.getByPlaceholder(/Password/).fill("Str0ngPassphrase!23");
await page.getByRole("button", { name: "Create account" }).click();
await page.waitForTimeout(4000);
console.log("  landed on", page.url());

console.log("\n[2. ask for a code from the gate]");
await page.goto(pw("/dashboard"), { waitUntil: "load" });
await hydrated(page);
await page.waitForTimeout(2000);
const send = page.getByRole("button", { name: /Send code|Resend code/ }).first();
if (await send.isVisible().catch(() => false)) {
  await send.click();
  await page.waitForTimeout(3000);
} else {
  console.log("  (no gate — verification is not being required on this server)");
}
await page.screenshot({ path: `${shots}/01-gate-or-dashboard.png`, fullPage: true });

console.log("\n[3. read the outbox on the admin sign-ups desk]");
await page.goto(pw("/admin"), { waitUntil: "load" });
await hydrated(page);
await page.waitForTimeout(2500);
await page.getByRole("button", { name: /Sign-ups/ }).first().click();
await page.getByText("Mail delivery", { exact: false }).first().waitFor({ timeout: 20000 });
await page.waitForTimeout(2500);
await page.getByText("Recent mail", { exact: false }).first().scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
await page.screenshot({ path: `${shots}/02-mail-panel.png`, fullPage: true });

const rows = await page.$$eval("ul li", (els) =>
  els
    .map((e) => e.innerText.replace(/\s+/g, " ").trim())
    .filter((t) => /(Accepted|Refused|Not sent)/.test(t)),
);
// The panel is a heading plus a definition list plus the tail, so read the body
// around the heading rather than trusting a single wrapper element.
const panelText = await page
  .evaluate(() => {
    const text = document.body.innerText.replace(/\s+/g, " ");
    const at = text.indexOf("Mail delivery");
    return at < 0 ? "" : text.slice(at, at + 700);
  })
  .catch(() => "");

console.log("  outbox rows:");
for (const r of rows) console.log("   ·", r);
console.log("  panel:", panelText);

const listed = await page
  .getByText("Nothing has been mailed", { exact: false })
  .isVisible()
  .catch(() => false);
const refused = rows.some((r) => /Refused/.test(r));
// The reason is the whole point: a row that says "Refused" without what the
// service answered still leaves the owner guessing.
const hasReason = rows.some((r) => /Resend \d{3}|not set/.test(r));
const ok = rows.length > 0 && refused && hasReason;

console.log(
  "\nRESULT:",
  ok
    ? `outbox works — ${rows.length} attempt(s) recorded, refusal reason visible`
    : listed
      ? "FAILED — the table recorded nothing"
      : "FAILED — rows exist but no refusal reason reached the panel",
);
console.log(
  "errors:",
  errors.filter((e) => !e.includes("ERR_INSUFFICIENT_RESOURCES")).slice(0, 6),
);

await browser.close();
process.exit(ok ? 0 : 1);
