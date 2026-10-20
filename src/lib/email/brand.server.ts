/**
 * Branded transactional mail — the house style for anything we send from the
 * account flow (verify address, welcome).
 *
 * Layout is table-based with inline styles because mail clients strip
 * `<style>` blocks and class selectors; the palette mirrors `src/styles.css`
 * (peach-pink `#FBE6DD`, brown `#5B3623`, terracotta `#A8532A`, line `#F0CDBD`).
 * Change the theme there and change these to match — mail clients cannot read
 * the stylesheet, so the two drift silently if nobody remembers.
 *
 * NEVER import this from client code.
 */
import { resendConfigured, sendEmail } from "./sender.server";

const escapeHtml = (value: string): string =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );

const BG = "#FBE6DD";
const CARD = "#FFFFFF";
const LINE = "#F0CDBD";
const INK = "#5B3623";
const MUTED = "#7D5A45";
const ACCENT = "#A8532A";

const SERIF = "Georgia,'Times New Roman',serif";
const SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif";

/**
 * Absolute origin for inline assets. Mail clients need a full URL, and the only
 * honest source of one is the auth base URL the deployment injects.
 */
function siteOrigin(): string | undefined {
  const explicit = process.env.BETTER_AUTH_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  return prod ? `https://${prod}` : undefined;
}

function wordmark(): string {
  const origin = siteOrigin();
  const mark = origin
    ? `<img src="${origin}/images/logo.png" width="72" height="51" alt="" style="display:block;margin:0 auto 12px;border:0;height:auto;width:72px" />`
    : "";
  return `<tr><td align="center" style="padding:40px 36px 26px">
    ${mark}
    <p style="margin:0;font-family:${SANS};font-size:15px;letter-spacing:.34em;color:${INK};text-transform:uppercase">Raakha&nbsp;Grace</p>
  </td></tr>`;
}

export type MailBlock = {
  /** Uppercase, letterspaced line under the rule. */
  headline: string;
  /** Serif paragraphs, rendered in order. */
  paragraphs: string[];
  /** Optional centred label + value pair ("Your login details" / the address). */
  details?: { label: string; value: string }[];
  cta?: { label: string; url: string };
  /** Small line under the button, e.g. the expiry window. */
  note?: string;
  /** Sign-off, e.g. "Yours sincerely," */
  closing?: string;
};

export function brandMail({ headline, paragraphs, details, cta, note, closing }: MailBlock): string {
  const body = paragraphs
    .map((p) => `<p style="margin:0 0 18px;font-family:${SERIF};font-size:15px;line-height:1.75;color:${INK}">${p}</p>`)
    .join("");

  const detailRows = (details ?? [])
    .map(
      (d) =>
        `<p style="margin:0 0 6px;font-family:${SERIF};font-size:15px;color:${INK}"><strong style="font-family:${SANS};font-size:13px;letter-spacing:.06em">${escapeHtml(d.label)}</strong><br/>${escapeHtml(d.value)}</p>`,
    )
    .join("");

  const button = cta
    ? `<tr><td align="center" style="padding:8px 36px 6px">
        <a href="${escapeHtml(cta.url)}" style="display:inline-block;background:${INK};color:${BG};font-family:${SANS};font-size:13px;letter-spacing:.2em;text-transform:uppercase;text-decoration:none;padding:17px 34px;border-radius:2px">${escapeHtml(cta.label)}</a>
      </td></tr>`
    : "";

  const fallback = cta
    ? `<p style="margin:14px 0 0;font-family:${SERIF};font-size:13px;line-height:1.6;color:${MUTED}">If the button does not work, copy this address into your browser:<br/><span style="color:${ACCENT};word-break:break-all">${escapeHtml(cta.url)}</span></p>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(headline)}</title>
</head>
<body style="margin:0;padding:0;background:${BG}">
  <div style="display:none;font-size:1px;color:${BG};line-height:1px;max-height:0;overflow:hidden">${escapeHtml(paragraphs[0]?.replace(/<[^>]+>/g, "") ?? headline)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG}">
    <tr><td align="center" style="padding:26px 12px 40px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${CARD};border:1px solid ${LINE};border-radius:4px">
        ${wordmark()}
        <tr><td style="padding:0 36px">
          <div style="height:1px;background:${LINE};line-height:1px;font-size:0">&nbsp;</div>
        </td></tr>
        <tr><td align="center" style="padding:34px 36px 26px">
          <p style="margin:0;font-family:${SANS};font-size:16px;letter-spacing:.14em;text-transform:uppercase;color:${INK}">${escapeHtml(headline)}</p>
        </td></tr>
        <tr><td style="padding:0 36px">${body}</td></tr>
        ${detailRows ? `<tr><td align="center" style="padding:0 36px 22px">${detailRows}</td></tr>` : ""}
        ${button}
        ${note ? `<tr><td align="center" style="padding:2px 36px 0"><p style="margin:0;font-family:${SERIF};font-size:13px;font-style:italic;color:${MUTED}">${escapeHtml(note)}</p></td></tr>` : ""}
        ${fallback ? `<tr><td style="padding:16px 36px 0">${fallback}</td></tr>` : ""}
        ${closing ? `<tr><td style="padding:26px 36px 34px"><p style="margin:0;font-family:${SERIF};font-size:15px;color:${INK}">${escapeHtml(closing)}</p><p style="margin:6px 0 0;font-family:${SANS};font-size:13px;letter-spacing:.22em;text-transform:uppercase;color:${INK}">Raakha Grace</p></td></tr>` : ""}
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
        <tr><td align="center" style="padding:20px 24px 0">
          <p style="margin:0;font-family:${SERIF};font-size:12px;line-height:1.7;color:${MUTED}">
            Handmade jewellery, shipped across India.<br/>
            Orders and enquiries on WhatsApp: <span style="color:${ACCENT}">+91 63048 37120</span><br/>
            You are receiving this because an account was created with this address.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** The "confirm your account" mail, sent by Better Auth on sign-up. */
export async function sendVerificationMail(input: {
  to: string;
  name: string;
  email: string;
  url: string;
  hours: number;
}): Promise<void> {
  const greeting = input.name.trim() ? `Dear ${escapeHtml(input.name.trim())},` : "Dear customer,";
  const html = brandMail({
    headline: "Confirm your account",
    paragraphs: [
      `${greeting}<br/>&nbsp;`,
      `Thank you for your interest in Raakha Grace.`,
      `To confirm your account, please click on the button below. This link will remain active for ${input.hours} hours.`,
    ],
    details: [{ label: "Your login details", value: input.email }],
    cta: { label: "Verify your account", url: input.url },
    note: "Once verified, your address is saved for booking confirmations and product enquiries.",
    closing: "Yours sincerely,",
  });
  const result = await sendEmail({ to: input.to, subject: "Confirm your Raakha Grace account", html });
  if (!result.ok) console.error("[auth] verification mail failed:", result.error);
}

/** The welcome mail, sent once for every new account (email or Google). */
export async function sendWelcomeMail(input: { to: string; name: string }): Promise<void> {
  const origin = siteOrigin();
  const greeting = input.name.trim() ? `Dear ${escapeHtml(input.name.trim())},` : "Dear friend,";
  const html = brandMail({
    headline: "Welcome to Raakha Grace",
    paragraphs: [
      `${greeting}<br/>&nbsp;`,
      `Thank you for believing in us. Every piece in the collection is strung, knotted and finished by hand at the bench, and it is a pleasure to have you with us.`,
      `Here is how an order works, so there are no surprises: write to us on WhatsApp with the piece you like, we confirm availability the same day, and nothing is held or dispatched before payment is received. Your account saves your address so booking confirmations and product enquiries reach the right inbox.`,
    ],
    cta: origin ? { label: "Browse the collection", url: `${origin}/jewellery` } : undefined,
    note: "Tip: record a continuous video while you open your parcel. It is the only proof we can accept for transit damage.",
    closing: "With thanks,",
  });
  const result = await sendEmail({
    to: input.to,
    subject: "Welcome to Raakha Grace",
    html,
  });
  if (!result.ok) console.error("[auth] welcome mail failed:", result.error);
}

/** True when both the key and a sender address are live. */
export function brandMailConfigured(): boolean {
  return resendConfigured();
}
