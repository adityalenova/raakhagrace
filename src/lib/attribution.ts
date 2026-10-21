/**
 * Where a booking came from, read off the visit itself.
 *
 * The site has no ad platform to report from and no analytics script that
 * survives a cookie banner, so the honest attribution it can do is to keep what
 * the browser already knows at the moment the customer books: the tags on the
 * link they arrived through, and the host that referred them. Instagram posts,
 * WhatsApp broadcasts and bio links all become measurable by appending
 * `?utm_source=instagram&utm_campaign=newyear` to the URL one shares — nothing
 * has to be installed for that to work.
 *
 * Client-side only; the values land in `createWhatsAppBooking` and are treated
 * as untrusted text there.
 */

/** Host of `https://www.instagram.com/p/…` → `instagram.com`. */
function referrerHost(referrer: string): string | undefined {
  if (!referrer || !/^https?:\/\//i.test(referrer)) return undefined;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
    // Our own pages are not a marketing channel.
    if (!host || host === location.hostname.replace(/^www\./, "")) return undefined;
    return host.slice(0, 60);
  } catch {
    return undefined;
  }
}

export type VisitAttribution = { source?: string; campaign?: string };

/**
 * Read once, at the moment of booking — `location.search` is the arrival URL
 * because this site is a single page and never rewrites those tags away.
 */
export function readAttribution(): VisitAttribution {
  if (typeof location === "undefined") return {};
  const params = new URLSearchParams(location.search);
  const source = params.get("utm_source")?.trim() || referrerHost(document.referrer || "");
  const campaign = params.get("utm_campaign")?.trim() || "";
  return {
    ...(source ? { source: source.slice(0, 60) } : {}),
    ...(campaign ? { campaign: campaign.slice(0, 80) } : {}),
  };
}
