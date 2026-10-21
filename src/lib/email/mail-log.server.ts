/**
 * The mail outbox log — a durable answer to "did that code actually go out?"
 *
 * `sendEmail` is the single choke point every message in this app passes
 * through, so recording there means no caller can forget to report a failure.
 * The row is what the admin "Mail delivery" panel reads; it exists because the
 * hosting plan keeps runtime logs for well under an hour, and a customer's
 * complaint about a missing code always arrives after that window has closed.
 *
 * NEVER import this from client code, and never let it throw: mail that was
 * already accepted must not be reported as a failure because its audit row
 * could not be written.
 */

import { getSql } from "../db";

/** What the log calls a message, chosen by the caller that sent it. */
export type MailKind =
  | "code"
  | "welcome"
  | "link"
  | "enquiry"
  | "order"
  | "probe"
  | "mail";

/** Three-way outcome, so "we never tried" is distinguishable from "it refused". */
export type MailStatus = "sent" | "refused" | "skipped";

export type MailLogEntry = {
  id: number;
  kind: MailKind;
  recipient: string;
  status: MailStatus;
  detail: string | null;
  createdAt: string;
};

/** Refusal bodies can be a whole HTML page; the useful part is the front of it. */
const DETAIL_LIMIT = 400;

/**
 * How long an attempt stays on file, and therefore what `/data-protection` may
 * claim. Pruning rides on the insert rather than on a scheduled job: there is no
 * cron on this plan, a shop this size mails a few dozen times a day at most, and
 * a receipt nobody prunes is a promise the policy page cannot keep.
 */
const KEEP_DAYS = 90;

/**
 * `adityalenova@gmail.com` -> `a***@gmail.com`.
 *
 * Enough to tell the atelier's own address from a customer's, which is the
 * distinction that matters when the sender is a test one, without keeping a
 * second, never-erased copy of every customer's address.
 */
export function maskEmail(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0) return trimmed.slice(0, 1) + "***";
  return `${trimmed.slice(0, 1)}***${trimmed.slice(at)}`;
}

/**
 * Append one attempt. Fire-and-forget-safe: every failure path is swallowed
 * into a log line, because this is an audit trail and not the message itself.
 */
export async function recordMail(input: {
  kind: MailKind;
  to: string;
  status: MailStatus;
  detail?: string | null;
}): Promise<void> {
  try {
    const sql = await getSql();
    await sql.query(
      `insert into mail_log (kind, recipient, status, detail)
       values ($1, $2, $3, $4)`,
      [
        input.kind,
        maskEmail(input.to),
        input.status,
        (input.detail ?? "").slice(0, DETAIL_LIMIT) || null,
      ],
    );
    // Same call, so the tail can never grow past the window the policy page
    // states. Nothing depends on it succeeding twice in a row.
    await sql.query(`delete from mail_log where created_at < now() - interval '${KEEP_DAYS} days'`);
  } catch (err) {
    // The common real cause is a database this deployment cannot reach, which
    // must not turn a delivered email into an error for the customer.
    console.error("[mail] could not record", input.kind, input.status, err);
  }
}

/** The most recent attempts, newest first — what the admin panel lists. */
export async function recentMail(limit = 20): Promise<MailLogEntry[]> {
  const sql = await getSql();
  const rows = await sql.query<{
    id: number | string;
    kind: string;
    recipient: string;
    status: string;
    detail: string | null;
    created_at: Date | string;
  }>(
    `select id, kind, recipient, status, detail, created_at
       from mail_log
      order by id desc
      limit $1`,
    [Math.min(Math.max(limit, 1), 100)],
  );
  return rows.map((r) => ({
    id: Number(r.id),
    kind: r.kind as MailKind,
    recipient: r.recipient,
    status: r.status as MailStatus,
    detail: r.detail,
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
  }));
}
