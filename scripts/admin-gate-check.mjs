/**
 * The owner's address must not be stopped by the customer's code step.
 *
 * Verification mail only reaches a real inbox once a sending domain is verified,
 * so a gate that also applies to the atelier locks the shop's own owner out of
 * their own dashboard. This checks both halves: the allowlisted address walks
 * straight in on its password, and a customer's address still meets the gate.
 *
 *   DATABASE_URL=" " BETTER_AUTH_URL="http://127.0.0.1:8091" \
 *   RESEND_API_KEY=not-a-real-key RESEND_FROM="Raakha Grace <onboarding@resend.dev>" \
 *   ADMIN_EMAILS=owner-check@example.com VITE_REQUIRE_EMAIL_VERIFICATION=true \
 *     node scripts/with-app-env.mjs vite dev --host 127.0.0.1 --port 8091
 *
 * Usage: node scripts/admin-gate-check.mjs [base] [adminEmail] [customerEmail]
 */
import { chromium } from "playwright";

const base = (process.argv[2] || "http://127.0.0.1:8091").replace(/\/$/, "");
const adminEmail = process.argv[3] || "owner-check@example.com";
const customerEmail = process.argv[4] || `customer-${Date.now()}@example.com`;
const pw = (s) => base + s;
const PASSWORD = "Str0ngPassphrase!23";
const errors = [];
const shots = new URL("../screenshots/admin-gate/", import.meta.url).pathname;
const { mkdirSync } = await import("node:fs");
mkdirSync(shots, { recursive: true });

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
);

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

/** Sign up through the real form and report where the browser ended up. */
async function signUp(email, name) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
  await page.goto(pw("/login"), { waitUntil: "load" });
  await hydrated(page);
  await page.getByText("Need an account? Create one").click();
  await page.getByPlaceholder("Your name").fill(name);
  await page.getByPlaceholder("Email address").fill(email);
  await page.getByPlaceholder(/Password/).fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForTimeout(4000);
  return { ctx, page };
}

/** Sign in to an existing address with the form a returning owner uses. */
async function signIn(email) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
  await page.goto(pw("/login"), { waitUntil: "load" });
  await hydrated(page);
  await page.getByPlaceholder("Email address").fill(email);
  await page.getByPlaceholder(/Password/).fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in with email" }).click();
  await page.waitForTimeout(4000);
  return { ctx, page };
}

async function describe(page, label) {
  const gate = await page
    .getByText("Confirm your email first", { exact: false })
    .isVisible()
    .catch(() => false);
  const card = await page
    .getByText("Owner’s desk", { exact: false })
    .isVisible()
    .catch(() => false);
  const opened = await page
    .getByText(/Hello,/)
    .isVisible()
    .catch(() => false);
  console.log(`  ${label}: gate=${gate} ownerCard=${card} dashboard=${opened} url=${page.url()}`);
  return { gate, card, opened };
}

console.log(`\n[1. the allowlisted address — ${adminEmail}]`);
const a = await signUp(adminEmail, "Owner Check");
await a.page.goto(pw("/dashboard"), { waitUntil: "load" });
await hydrated(a.page);
await a.page.waitForTimeout(2500);
const owner = await describe(a.page, "after sign-up");
await a.page.screenshot({ path: `${shots}/01-owner-dashboard.png`, fullPage: true });
await a.ctx.close();

// Signing in again by hand is the route the owner actually takes.
const b = await signIn(adminEmail);
await b.page.goto(pw("/dashboard"), { waitUntil: "load" });
await hydrated(b.page);
await b.page.waitForTimeout(2500);
const again = await describe(b.page, "after password sign-in");
await b.page.screenshot({ path: `${shots}/02-owner-signin.png`, fullPage: true });
await b.ctx.close();

console.log(`\n[2. a customer's address — ${customerEmail}]`);
const c = await signUp(customerEmail, "Customer Check");
const customer = await describe(c.page, "after sign-up");
await c.page.screenshot({ path: `${shots}/03-customer-gate.png`, fullPage: true });

const pass =
  !owner.gate && !again.gate && again.opened && again.card && customer.gate && !customer.card;

console.log(
  "\nRESULT:",
  pass
    ? "owner walks straight in; customer still meets the gate"
    : "FAILED — see the three lines above for which half broke",
);
console.log("page errors:", errors.slice(0, 6));

await browser.close();
process.exit(pass ? 0 : 1);
