/**
 * Resend HTTP sender — the only place that reads `RESEND_API_KEY`.
 *
 * Kept free of `createServerFn` (and of any TanStack Start import) so server-only
 * modules such as Better Auth's config can call it directly. The storefront's
 * callable wrapper lives in `./resend.server`.
 *
 * NEVER import this from client code.
 */

const RESEND_URL = "https://api.resend.com/emails";

/** Read an env var, treating empty/whitespace as unset. */
const env = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

export type SendResult = { ok: true; id: string } | { ok: false; error: string };

/** From-address, e.g. `Raakha Grace <hello@raakhagrace.com>`. */
export function resendFrom(): string | undefined {
  return env("RESEND_FROM");
}

/** The atelier inbox that receives order notifications. */
export function notifyInbox(): string | undefined {
  return env("ORDER_NOTIFY_EMAIL");
}

/** Google addresses allowed to open `/admin` (comma-separated `ADMIN_EMAILS`). */
export function adminEmails(): string[] {
  return (env("ADMIN_EMAILS") ?? "")
    .split(",")
    // Allowlists are typed into a dashboard by hand, and a stray pair of quotes
    // around an address silently denies its owner — `/admin` says "not on the
    // allowlist" rather than "your config has a typo". Drop them here.
    .map((entry) => entry.trim().replace(/^"(.*)"$/, "$1").trim().toLowerCase())
    .filter(Boolean);
}

/** True when both the API key and a verified sender address are configured. */
export function resendConfigured(): boolean {
  return Boolean(env("RESEND_API_KEY") && resendFrom());
}

/**
 * POST one email to Resend. Returns a result rather than throwing so callers can
 * log and continue — a bounced notification is never worth failing a request for.
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<SendResult> {
  const apiKey = env("RESEND_API_KEY");
  const from = resendFrom();
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY is not set" };
  if (!from) return { ok: false, error: "RESEND_FROM is not set" };

  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, error: `Resend ${res.status}: ${body.slice(0, 300)}` };
  }
  const json = (await res.json().catch(() => ({}))) as { id?: string };
  return { ok: true, id: json.id ?? "" };
}
