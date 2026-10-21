/**
 * Resend HTTP sender — the only place that reads `RESEND_API_KEY`.
 *
 * Kept free of `createServerFn` (and of any TanStack Start import) so server-only
 * modules such as Better Auth's config can call it directly. The storefront's
 * callable wrapper lives in `./resend.server`.
 *
 * NEVER import this from client code.
 */

import { recordMail, type MailKind } from "./mail-log.server";

const RESEND_URL = "https://api.resend.com/emails";

/** Read an env var, treating empty/whitespace as unset. */
const env = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

export type SendResult = { ok: true; id: string } | { ok: false; error: string; skipped?: boolean };

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
 *
 * Every attempt, including the ones that never left this file, is written to
 * `mail_log` (see `./mail-log.server`). That is deliberate: an accepted send and
 * a refused one look identical to the customer, and the runtime line that
 * records the refusal is gone before anyone asks about it.
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  /** What this message is, for the outbox log. Defaults to a plain "mail". */
  kind?: MailKind;
}): Promise<SendResult> {
  const kind: MailKind = input.kind ?? "mail";
  const apiKey = env("RESEND_API_KEY");
  const from = resendFrom();
  if (!apiKey) {
    await recordMail({ kind, to: input.to, status: "skipped", detail: "RESEND_API_KEY is not set" });
    // `skipped` says the mail service was never asked — a desk that reports
    // "the mail service refused it" for a message that never left the server
    // sends the owner looking in the wrong place.
    return { ok: false, skipped: true, error: "RESEND_API_KEY is not set" };
  }
  if (!from) {
    await recordMail({ kind, to: input.to, status: "skipped", detail: "RESEND_FROM is not set" });
    return { ok: false, skipped: true, error: "RESEND_FROM is not set" };
  }

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
  }).catch(async (err: unknown) => {
    const detail = err instanceof Error ? `fetch failed: ${err.message}` : "fetch failed";
    await recordMail({ kind, to: input.to, status: "refused", detail });
    console.error(`[mail] ${kind} to ${input.to} never reached Resend — ${detail}`);
    throw err;
  });

  const body = await res.text().catch(() => "");

  if (!res.ok) {
    const detail = `Resend ${res.status}: ${body.slice(0, 300)}`;
    await recordMail({ kind, to: input.to, status: "refused", detail });
    console.error(`[mail] ${kind} to ${input.to} refused — ${detail}`);
    return { ok: false, error: detail };
  }

  let id = "";
  try {
    id = ((JSON.parse(body) as { id?: string }).id ?? "").slice(0, 60);
  } catch {
    // Resend answered 2xx with something that is not the JSON it normally
    // returns. The message was accepted, so record that, and keep the front of
    // whatever did come back as the detail.
  }
  await recordMail({ kind, to: input.to, status: "sent", detail: id || body.slice(0, 60) });
  // Accepted mail is logged as loudly as refused mail: "no line at all" used to
  // be the only evidence that a send worked, and an empty log is too easy to
  // mistake for a log that was never written.
  console.info(`[mail] ${kind} to ${input.to} accepted by Resend (${id || "no id"})`);
  return { ok: true, id };
}
