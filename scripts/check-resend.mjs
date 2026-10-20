/**
 * One-shot mail diagnostic: asks Resend to deliver a message to the atelier's own
 * admin address and prints exactly what came back.
 *
 * Run with `node scripts/check-resend.mjs`. Nothing is stored; the key is read
 * from `.env` and never printed.
 */
import { readFileSync } from "node:fs";

function loadEnv(file) {
  const out = {};
  try {
    for (const line of readFileSync(new URL(file, import.meta.url), "utf8").split("\n")) {
      const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
      // Strip one layer of matching quotes the way Vite's own dotenv loader does,
      // so a value written as `ADMIN_EMAILS="a@b.com"` parses to `a@b.com`.
      if (m && out[m[1]] === undefined) out[m[1]] = m[2].trim().replace(/^"(.*)"$/, "$1");
    }
  } catch {
    /* file absent */
  }
  return out;
}

const env = { ...loadEnv("../.env"), ...loadEnv("../.env.local"), ...process.env };
const key = env.RESEND_API_KEY?.trim();
const from = env.RESEND_FROM?.trim();
const to =
  process.argv[2] ||
  (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)[0];

if (!key) {
  console.log("RESULT: RESEND_API_KEY is not set — no mail can leave the app.");
  process.exit(0);
}
console.log(`from  : ${from || "(unset)"}`);
console.log(`to    : ${to || "(unset)"}`);
if (!from || !to) {
  console.log("RESULT: missing RESEND_FROM or ADMIN_EMAILS.");
  process.exit(0);
}

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
  body: JSON.stringify({
    from,
    to: [to],
    subject: "Raakha Grace — mail delivery check",
    html:
      "<p>This is a one-off delivery check from the Raakha Grace storefront.</p>" +
      "<p>If you can read it, verification links and order confirmations will reach customers " +
      "from this sender address. If your inbox is quiet, the sender still needs a verified domain.</p>",
  }),
});

const body = await res.text();
console.log(`status: ${res.status}`);
console.log(`body  : ${body.slice(0, 500)}`);
