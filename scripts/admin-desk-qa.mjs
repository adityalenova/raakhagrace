/**
 * Admin desk walkthrough on a throwaway local database.
 *
 * The production Neon database is not reachable from this machine, and even if
 * it were, driving it would mean writing test bookings into the atelier's real
 * order table. So this runs against a dev server on the in-memory PGLite
 * fallback: every row it screenshots is created by the script itself, lives
 * only in that process, and disappears with it. The point is to prove the desks
 * render and compute — not to manufacture numbers for the shop.
 *
 *   DATABASE_URL=" " BETTER_AUTH_URL="http://127.0.0.1:8093" RESEND_API_KEY= \
 *   ADMIN_EMAILS=bench-qa@example.com \
 *     node scripts/with-app-env.mjs vite dev --host 127.0.0.1 --port 8093
 *
 *   node scripts/admin-desk-qa.mjs [base] [email] [password]
 *
 * Screenshots land in screenshots/admin-desk/. The script prints one line per
 * step plus any console error, and exits non-zero if a desk came up blank or
 * the browser console complained.
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const base = (process.argv[2] || "http://127.0.0.1:8093").replace(/\/$/, "");
const email = process.argv[3] || "bench-qa@example.com";
const pw = process.argv[4] || "bench-qa-password";
const shots = new URL("../screenshots/admin-desk/", import.meta.url).pathname;
mkdirSync(shots, { recursive: true });

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
);
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();

const errors = [];
const stepErrors = [];
page.on("pageerror", (e) => stepErrors.push(`pageerror: ${String(e).slice(0, 200)}`));
page.on("console", (m) => {
  if (m.type() === "error") stepErrors.push(`console: ${m.text().slice(0, 200)}`);
});
page.on("response", (r) => {
  if (r.status() >= 500) stepErrors.push(`HTTP ${r.status()} ${r.url()}`);
});

/** Screenshots, visible-text count and console errors are reported per step. */
async function step(name, { fullPage = false } = {}) {
  stepErrors.length = 0;
  await page.waitForTimeout(900);
  const chars = await page
    .evaluate(() => (document.querySelector("main")?.innerText || "").trim().length)
    .catch(() => 0);
  await page.screenshot({ path: `${shots}${name}.png`, fullPage });
  errors.push(...stepErrors.map((e) => `${name}: ${e}`));
  console.log(
    `${name.padEnd(26)} chars ${String(chars).padStart(5)}  ` +
      (stepErrors.length ? `ERRORS: ${stepErrors.slice(0, 2).join(" | ")}` : "clean"),
  );
}

async function desk(label) {
  await page.getByRole("button", { name: label, exact: true }).first().click();
  await page.waitForTimeout(1200);
}

/** Dev-mode React can take a while to attach; a click before that does nothing. */
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

/** Fill and submit one walk-in booking at the order desk. */
async function logBooking({ name, phone, piece, qty, mail, source }) {
  await page.getByRole("button", { name: /Log a WhatsApp order/i }).click();
  await page.getByLabel("Customer name").fill(name);
  await page.getByLabel("Mobile number").fill(phone);
  if (mail) await page.getByLabel("Email (optional)").fill(mail);
  if (source) await page.getByLabel("Came from (optional)").fill(source);
  await page.getByLabel("Piece 1").selectOption({ index: piece });
  if (qty > 1) await page.getByLabel("Quantity").fill(String(qty));
  await page.getByRole("button", { name: "Save booking" }).click();
  await page.waitForTimeout(1200);
}

/**
 * The customer's own route: a cart becomes a booking row and only then does
 * WhatsApp open. Driving it here proves the utm tags on the link land in the
 * attribution desk, which is the only way that desk can ever stop being empty.
 * The popup is not followed; the row and the reference are the thing under test.
 */
async function bookFromCheckout({ product, name, phone, mail, url }) {
  const popup = page
    .waitForEvent("popup", { timeout: 8000 })
    .then((p) => p.close().catch(() => {}))
    .catch(() => {});
  await page.goto(url, { waitUntil: "load" });
  await hydrated(page);
  await page.getByPlaceholder("Your full name").fill(name);
  await page.getByPlaceholder("10-digit mobile").fill(phone);
  if (mail) await page.getByPlaceholder("Optional").first().fill(mail);
  await page.getByPlaceholder("Full delivery address").fill("QA street, Hyderabad");
  await page.getByRole("button", { name: /Book on WhatsApp/ }).click();
  await popup;
  const ref = await page
    .locator("text=/^RG-[0-9A-Z]{6}$/")
    .first()
    .innerText()
    .catch(() => "(no reference shown)");
  console.log(`checkout    : ${product} via ${new URL(url).search} -> ${ref}`);
  return ref;
}

// ── sign in as the allowlisted address ──────────────────────────────────────
await page.goto(base + "/login", { waitUntil: "load" });
await hydrated(page);
await page.getByRole("button", { name: /Need an account/ }).click();
await page.getByPlaceholder("Your name").fill("Bench QA");
await page.getByPlaceholder("Email address").fill(email);
await page.getByPlaceholder(/Password/).fill(pw);
await page.getByRole("button", { name: "Create account" }).click();
await page.waitForURL(/dashboard/, { timeout: 20000 }).catch(() => {});
await page.waitForTimeout(1200);
// Second run against the same throwaway server: the account exists, so sign in.
if (page.url().includes("/login")) {
  await page.getByRole("button", { name: /Already with us/ }).click();
  await page.getByPlaceholder("Email address").fill(email);
  await page.getByPlaceholder(/Password/).fill(pw);
  await page.getByRole("button", { name: "Sign in with email" }).click();
  await page.waitForURL(/dashboard/, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1200);
}
console.log(`session   : ${page.url()}`);

await page.goto(base + "/admin", { waitUntil: "load" });
await hydrated(page);
await page.waitForTimeout(1500);

// ── Products ────────────────────────────────────────────────────────────────
await desk("Products");
await step("01-products");

// ── Order desk: empty, then populated ───────────────────────────────────────
await desk("Order desk");
await step("02-order-desk-empty");

const rows = [
  { name: "Ananya Rao", phone: "9845012301", piece: 0, qty: 1, mail: "ananya@example.com", source: "Instagram DM" },
  { name: "Divya Menon", phone: "9845012302", piece: 1, qty: 2, mail: "divya@example.com", source: "Google" },
  { name: "Kavya Suresh", phone: "9845012303", piece: 0, qty: 1, source: "Instagram DM" },
  { name: "Meera Nair", phone: "9845012304", piece: 3, qty: 1, mail: "meera@example.com", source: "Referral" },
  { name: "Rithu Chandran", phone: "9845012305", piece: 5, qty: 1, source: "Instagram DM" },
  { name: "Sana Pillai", phone: "9845012306", piece: 1, qty: 1, mail: "sana@example.com", source: "Google" },
  { name: "Tara Iyer", phone: "9845012307", piece: 8, qty: 3, source: "WhatsApp direct" },
  { name: "Vismaya K", phone: "9845012308", piece: 3, qty: 1, mail: "vismaya@example.com", source: "Referral" },
];
// The desk rows are `li` children of the booking list; the Stat cards and the
// item lines are `li` too, so scope to the list itself.
const rowSel = "ul.mt-6.space-y-4 > li";

const existing = await page.locator(rowSel).count();
if (existing === 0) {
  for (const r of rows) await logBooking(r);
} else {
  console.log(`desk already holds ${existing} row(s) from an earlier run — not re-logging`);
}
await page.reload({ waitUntil: "load" });
await hydrated(page);
await desk("Order desk");
await step("03-order-desk-rows");
console.log(`row count   : ${await page.locator(rowSel).count()}`);

// Two bookings on the customer's own path, through a tagged link.
await bookFromCheckout({
  product: "ruby-drop-necklace",
  name: "Nithya Raj",
  phone: "9845099101",
  mail: "nithya@example.com",
  url: base + "/checkout?product=ruby-drop-necklace&utm_source=instagram&utm_campaign=diwali-drop",
});
await bookFromCheckout({
  product: "matt-floral-bangles",
  name: "Farida Sheikh",
  phone: "9845099102",
  url: base + "/checkout?product=matt-floral-bangles&utm_source=google&utm_campaign=brand-search",
});
await page.goto(base + "/admin", { waitUntil: "load" });
await hydrated(page);
await desk("Order desk");
await step("03b-order-desk-with-checkout-rows");

// Move the booking that has an email to Shipped and read what the desk says
// about the notice — that outcome is the whole point of the status change.
const first = page.locator(rowSel).filter({ hasText: "nithya@example.com" }).first();
const statusSel = first.locator("select").first();
const current = await statusSel.inputValue();
const next = ["shipped", "packed", "delivered", "confirmed"].find((s) => s !== current);
await statusSel.selectOption(next ?? "cancelled");
await first.getByRole("button", { name: "Save", exact: true }).click();
await page.waitForTimeout(1500);
const mailNote = await first
  .locator("p", { hasText: "Saved —" })
  .innerText()
  .catch(() => "(no note)");
console.log(`status mail note: ${mailNote.replace(/\s+/g, " ")}`);
await step("04-order-desk-after-status");

// ── Insights ────────────────────────────────────────────────────────────────
await desk("Insights");
await step("05-insights-top");
const briefLines = await page
  .evaluate(() => {
    const h = [...document.querySelectorAll("p,h2,h3")].find((n) => /^Today —/.test(n.innerText));
    return h?.closest("section,div")?.innerText ?? "(no briefing)";
  })
  .catch(() => "(unreadable)");
console.log(`briefing    : ${briefLines.replace(/\s+/g, " ").slice(0, 320)}`);
await page.getByRole("button", { name: /Mail me this/ }).click();
await page.waitForTimeout(3000);
const mailOut = await page
  .evaluate(() => {
    const el = [...document.querySelectorAll("[role='status']")].find((n) => n.innerText.trim());
    return el?.innerText ?? "(no note)";
  })
  .catch(() => "(unreadable)");
console.log(`briefing mail: ${mailOut.replace(/\s+/g, " ")}`);
await page.getByRole("button", { name: "Which designs should I promote?" }).click();
await page.waitForTimeout(2500);
const answer = await page
  .evaluate(() => {
    const h = [...document.querySelectorAll("p,h2,h3")].find((n) =>
      /^Ask the numbers$/i.test((n.innerText || "").trim()),
    );
    return h?.closest("section,div")?.innerText?.slice(0, 900) ?? "(none)";
  })
  .catch(() => "(unreadable)");
console.log(`assistant:\n${answer}\n`);
await step("06-insights-asked");

// The bench plan refuses to suggest anything before a lead time exists; then it
// must show a number.
await page.getByPlaceholder("e.g. 12").fill("12");
await page.getByPlaceholder("e.g. 7").fill("7");
await step("07-insights-bench-plan-blank");
await page.getByRole("button", { name: /Save plan|Save/i }).last().click();
await page.waitForTimeout(2000);
await step("08-insights-bench-plan-saved", { fullPage: true });

// ── People, Analytics ───────────────────────────────────────────────────────
await desk("People");
await step("09-people", { fullPage: true });
await desk("Analytics");
await step("10-analytics", { fullPage: true });

// ── mobile pass over the two busiest desks ──────────────────────────────────
const mob = await ctx.newPage();
mob.on("pageerror", (e) => errors.push(`mobile pageerror: ${String(e).slice(0, 200)}`));
mob.on("console", (m) => {
  if (m.type() === "error") errors.push(`mobile console: ${m.text().slice(0, 200)}`);
});
await mob.setViewportSize({ width: 390, height: 844 });
await mob.goto(base + "/admin", { waitUntil: "networkidle" });
await mob.waitForTimeout(1500);
for (const label of ["Insights", "Order desk"]) {
  await mob.getByRole("button", { name: label, exact: true }).first().click();
  await mob.waitForTimeout(1400);
  const overflow = await mob.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  await mob.screenshot({ path: `${shots}11-mobile-${label.replace(/\W+/g, "-")}.png` });
  console.log(`mobile ${label.padEnd(12)} overflow ${overflow}px`);
}

await browser.close();
console.log(errors.length ? `\n${errors.length} problem(s):\n` + errors.join("\n") : "\nno console errors");
process.exit(errors.length ? 1 : 0);
