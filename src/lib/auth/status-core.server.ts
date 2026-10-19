/**
 * Sign-in capability probes (server-only, dependency-free).
 *
 * Split from `server.ts` so `status.server.ts` can report the same booleans
 * without constructing the Better Auth instance (and opening the DB pool).
 * `server.ts` imports these, so the two can never disagree about what is
 * configured.
 *
 * Reads env only — exports no secret values.
 */
import { emailAndPasswordEnabled } from "./email-password";

/** Read an env var, treating empty/whitespace as unset. */
export const env = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

/** Direct Google OAuth client (Google Cloud Console → OAuth client for Web). */
export const googleClientId = env("GOOGLE_CLIENT_ID");
export const googleClientSecret = env("GOOGLE_CLIENT_SECRET");
export const googleEnabled = Boolean(googleClientId && googleClientSecret);

/** Grok auth-broker federation, only when the deployer injects a real client. */
export const grokClientId = env("GROK_AUTH_CLIENT_ID");
export const grokClientSecret = env("GROK_AUTH_CLIENT_SECRET");
export const brokerEnabled = Boolean(grokClientId && grokClientSecret);

/** Explicit off-switch for a UI-only deploy (`VITE_AUTH_ENABLED=false`). */
export const authDisabled = env("VITE_AUTH_ENABLED") === "false";

/** Local email/password, gated by the `./email-password` flag AND the master switch. */
export const emailPasswordEnabled = (): boolean => !authDisabled && emailAndPasswordEnabled;

/**
 * True when any real sign-in path is live.
 *
 * Email/password counts on its own — a deploy with no OAuth client still has a
 * working account system — so this is the union of every path, not just the
 * federated providers.
 */
export const signInEnabled = (): boolean =>
  !authDisabled && (googleEnabled || brokerEnabled || emailPasswordEnabled());
