/**
 * End-to-end check of the typed-code confirmation flow.
 *
 * Point it at a dev server that is (a) running the in-memory PGLite fallback and
 * (b) has no Resend key, so `emailOTP` prints the code to the server log instead
 * of mailing it. That is the only way to watch the real endpoint work without
 * touching the production Neon database or the owner's inbox.
 *
 *   DATABASE_URL=" " RESEND_API_KEY= VITE_REQUIRE_EMAIL_VERIFICATION=true \
 *     node scripts/with-app-env.mjs vite dev --host 127.0.0.1 --port 8091
 *
 * Usage: node scripts/otp-flow.mjs [base] [email] [logfile]
 */
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const base = (process.argv[2] || "http://127.0.0.1:8091").replace(/\/$/, "");
const email = process.argv[3] || `probe-${Date.now()}@example.com`;
const logFile = process.argv[4] || "/tmp/rg-otp-dev.log";
const shots = new URL("../screenshots/otp-flow/", import.meta.url).pathname;
const { mkdirSync } = await import("node:fs");
mkdirSync(shots, { recursive: true });

const pw = (s) => base + s;
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
// The two OTP endpoints are the thing under test; record what they answer.
page.on("response", async (r) => {
  if (!r.url().includes("/api/auth/")) return;
  let body = "";
  try {
    body = (await r.text()).slice(0, 200);
  } catch {}
  console.log(`  -> ${r.status()} ${new URL(r.url()).pathname} ${body}`);
});

function codeFromLog() {
  const tail = readFileSync(logFile, "utf8")
    .split("\n")
    .filter((l) => l.includes(email));
  const last = tail[tail.length - 1];
  const m = last?.match(/:\s*(\d{6})\s*$/);
  return m?.[1];
}

async function waitForCode(afterLineCount, timeoutMs = 15000) {
  const start = Date.now();
  for (;;) {
    const lines = readFileSync(logFile, "utf8").split("\n");
    if (lines.length > afterLineCount) {
      const c = codeFromLog();
      if (c) return c;
    }
    if (Date.now() - start > timeoutMs) return undefined;
    await new Promise((r) => setTimeout(r, 250));
  }
}

const logLines = () => readFileSync(logFile, "utf8").split("\n").length;
const step = (msg) => console.log(`\n[${msg}]`);

/**
 * Vite compiles on first hit, so the login page can sit un-hydrated for several
 * seconds. React attaches a fiber to the DOM node it owns, so once that appears
 * the buttons actually do something when clicked.
 */
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

step("1. sign up");
await page.goto(pw("/login"), { waitUntil: "load" });
await hydrated(page);
await page.getByText("Need an account? Create one").click();
await page.getByPlaceholder("Your name").waitFor({ timeout: 15000 });
await page.getByPlaceholder("Your name").fill("OTP Probe");
await page.getByPlaceholder("Email address").fill(email);
await page.getByPlaceholder(/Password/).fill("Str0ngPassphrase!23");
await page.getByRole("button", { name: "Create account" }).click();
await page.waitForURL(/dashboard|login|\/$/, { timeout: 20000 }).catch(() => {});
await page.waitForTimeout(2500);
console.log("  landed on", page.url());
await page.screenshot({ path: `${shots}/01-after-signup.png`, fullPage: false });

const signupCode = codeFromLog();
console.log("  code logged at sign-up:", signupCode ?? "(none)");

step("2. gate screen");
await page.goto(pw("/dashboard"), { waitUntil: "load" });
await hydrated(page);
await page.waitForTimeout(2500);
const gate = await page
  .getByText("Confirm your email first")
  .isVisible()
  .catch(() => false);
console.log("  gate shown:", gate);
console.log(
  "  panel heading:",
  await page
    .getByText("Enter the code we mailed you")
    .isVisible()
    .catch(() => false),
);
await page.screenshot({ path: `${shots}/02-gate.png`, fullPage: true });

step("3. send code");
const before = logLines();
const sendBtn = page.getByRole("button", { name: /Send code|Resend code|Resend in/ }).first();
await sendBtn.click();
await page.waitForTimeout(1500);
const code = await waitForCode(before);
console.log("  code from the mailer:", code ?? "(none in log)");
await page.screenshot({ path: `${shots}/03-sent.png`, fullPage: true });

if (!code) {
  console.log("\nRESULT: no code reached the log — send path is broken");
  console.log("errors:", errors);
  await browser.close();
  process.exit(1);
}

step("4. wrong code is refused");
const boxes = page.locator('input[aria-label^="Digit "]');
await boxes.first().click();
await boxes.nth(0).fill("0");
await page.waitForTimeout(200);
for (let i = 1; i < 6; i++) {
  await boxes.nth(i).fill("1");
}
await page.waitForTimeout(2000);
console.log(
  "  refusal copy visible:",
  await page
    .getByText(/not the code we sent/)
    .isVisible()
    .catch(() => false),
);
await page.screenshot({ path: `${shots}/04-wrong.png`, fullPage: true });

step("5. the real code opens the door");
await page.reload({ waitUntil: "load" });
await hydrated(page);
await page.waitForTimeout(1500);
const again = page.getByRole("button", { name: /Send code|Resend code/ }).first();
const before2 = logLines();
await again.click();
await page.waitForTimeout(1200);
const fresh = await waitForCode(before2);
console.log("  fresh code:", fresh ?? "(none)");
const boxes2 = page.locator('input[aria-label^="Digit "]');
await boxes2.first().click();
for (const d of (fresh ?? code).split("")) {
  await page.keyboard.press(d);
}
await page.waitForTimeout(3500);
const opened = await page
  .getByText(/Hello,/)
  .isVisible()
  .catch(() => false);
console.log("  dashboard opened:", opened);
await page.screenshot({ path: `${shots}/05-verified.png`, fullPage: true });

step("6. session says verified");
const state = await ctx.storageState();
console.log(
  "  cookies:",
  (state.cookies ?? [])
    .filter((c) => c.name.includes("session"))
    .map((c) => `${c.name}=${c.value.slice(0, 8)}…`),
);

/*
 * Phone pass. Two things to see at 390×844: the owner's card, and the code
 * panel before and after a send — six boxes plus a button is the layout most
 * likely to overflow on a narrow screen.
 */
step("7. mobile");
const mob = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  storageState: state,
});
const mpage = await mob.newPage();
await mpage.goto(pw("/dashboard"), { waitUntil: "load" });
await hydrated(mpage);
await mpage.waitForTimeout(2000);
const owner = await mpage
  .getByText("Owner’s desk", { exact: false })
  .isVisible()
  .catch(() => false);
console.log("  owner card on phone:", owner);
await mpage.screenshot({ path: `${shots}/06-mobile-owner.png`, fullPage: true });
const overflow = await mpage.evaluate(
  () => document.documentElement.scrollWidth > window.innerWidth + 1,
);
console.log("  horizontal overflow:", overflow);

const mob2 = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});
const p2 = await mob2.newPage();
await p2.goto(pw("/login"), { waitUntil: "load" });
await hydrated(p2);
await p2.getByText("Need an account? Create one").click();
await p2.getByPlaceholder("Your name").fill("Phone Probe");
await p2.getByPlaceholder("Email address").fill(`phone-${Date.now()}@example.com`);
await p2.getByPlaceholder(/Password/).fill("Str0ngPassphrase!23");
await p2.getByRole("button", { name: "Create account" }).click();
await p2.waitForURL(/dashboard/, { timeout: 20000 }).catch(() => {});
await hydrated(p2);
await p2.waitForTimeout(1500);
await p2.screenshot({ path: `${shots}/07-mobile-gate.png`, fullPage: true });
await p2
  .getByRole("button", { name: /Send code/ })
  .first()
  .click();
await p2.waitForTimeout(2000);
await p2.screenshot({ path: `${shots}/08-mobile-sent.png`, fullPage: true });
const mobOverflow = await p2.evaluate(
  () => document.documentElement.scrollWidth > window.innerWidth + 1,
);
console.log("  gate overflow on phone:", mobOverflow);

console.log(
  "\nconsole/page errors:",
  errors.filter((e) => !e.includes("ERR_INSUFFICIENT_RESOURCES")).length ||
    "(none beyond dev-server module noise)",
);
console.log(errors.filter((e) => !e.includes("ERR_INSUFFICIENT_RESOURCES")).slice(0, 8));
console.log("RESULT:", opened && !overflow && !mobOverflow ? "code flow works" : "FAILED");

await browser.close();
process.exit(opened && !overflow && !mobOverflow ? 0 : 1);
