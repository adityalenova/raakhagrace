/**
 * Client-safe half of the Cloudflare Turnstile config.
 *
 * The site key is public by design — it names the widget, it grants nothing — so
 * it ships in the browser bundle as a `VITE_` var. The matching secret lives only
 * in `turnstile.server.ts` and never reaches the client.
 *
 * When the key is absent the captcha is off entirely: the form renders no widget
 * and Better Auth registers no captcha plugin, so a deploy without Cloudflare
 * wired up still signs people in rather than locking the shop.
 */

const rawSiteKey = (import.meta.env as Record<string, string | undefined> | undefined)
  ?.VITE_TURNSTILE_SITE_KEY;

/** The public sitekey, or `undefined` when captcha is not configured. */
export const TURNSTILE_SITE_KEY: string | undefined = rawSiteKey?.trim()
  ? rawSiteKey.trim()
  : undefined;

/** True when the browser half of captcha is configured. */
export function turnstileConfigured(): boolean {
  return Boolean(TURNSTILE_SITE_KEY);
}
