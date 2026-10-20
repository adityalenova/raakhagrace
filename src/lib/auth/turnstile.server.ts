/**
 * Server-only half of the Cloudflare Turnstile config.
 *
 * The secret is read here and nowhere else, so it cannot leak into a client
 * chunk. Same empty-means-unset rule as the email sender.
 *
 * NEVER import this from client code.
 */

const env = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

/** Cloudflare's private key for this widget. */
export function turnstileSecretKey(): string | undefined {
  return env("TURNSTILE_SECRET_KEY");
}

/**
 * The browser-side site key, as the server can see it. Vercel exposes every
 * project variable to server functions, so `VITE_TURNSTILE_SITE_KEY` is readable
 * here even though it is also inlined into the client bundle.
 */
export function turnstileSiteKey(): string | undefined {
  return env("VITE_TURNSTILE_SITE_KEY");
}

/**
 * True when the server will demand a solved captcha on sign-up, sign-in and
 * password reset.
 *
 * Both halves are required, deliberately. With only the secret set, the login
 * page renders no widget, so no visitor can ever produce a token, and every
 * email sign-in is refused with "Missing CAPTCHA response" — a shop that looks
 * fine and lets nobody in. A half-configured Turnstile is worse than none, so
 * the pair is treated as one switch.
 */
export function captchaRequired(): boolean {
  return Boolean(turnstileSecretKey() && turnstileSiteKey());
}
