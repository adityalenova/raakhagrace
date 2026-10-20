/**
 * Self-hosted Better Auth for THIS app (server-only).
 *
 * Pre-wired for live preview + deploy — do not rewrite this file. To enable
 * local email/password, flip the flag in `./email-password` only (see auth skill).
 *
 * The app runs its own Better Auth at `/api/auth/*`, so the session cookie stays
 * on this app's own origin. Sign-in federates to the shared **Grok auth broker**
 * (`GROK_AUTH_ISSUER`) via the `genericOAuth` plugin — the broker brokers the
 * upstream sign-in methods (Google, X, …) and holds their shared secrets; this
 * app only holds its own client id/secret and names the upstream it wants via
 * each provider's `idp` hint.
 *
 * Tri-mode:
 *   - Deployed: the deployer injects a per-app `GROK_AUTH_*` + `BETTER_AUTH_URL`
 *     + `DATABASE_URL`, so real federated auth is persisted in Postgres.
 *   - Sandbox live preview: no injection -> falls back to the shared **preview
 *     client** (`./preview`) and derives the preview's `https://*.grok-sandbox.com`
 *     origin from the request, so real sign-in works (no demo users). Sessions
 *     and identities persist in the embedded PGLite DB (same DB as app data);
 *     the process restart wipes both. Live-preview iframe clients use a bearer
 *     token (partitioned cookies) — see `client.ts`.
 *   - Off (`VITE_AUTH_ENABLED=false`, the shipped default): no providers;
 *     `requireUserId` resolves a dev user with no database configured, and
 *     throws fail-closed once `DATABASE_URL` is set (see `verify.server.ts`).
 *
 * NEVER import this from client code — it pulls in `pg` + the preview secret +
 * server-only Better Auth internals. The client uses `@/lib/auth/client`;
 * components read the user via `@/lib/auth/use-current-user`; server functions get
 * a verified id via `@/lib/auth/middleware`.
 */
import { betterAuth } from "better-auth";
import { bearer, captcha, emailOTP, genericOAuth } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getCookie } from "@tanstack/react-start/server";
import { randomBytes } from "node:crypto";
import { Pool } from "pg";
import { ensureDbReady, getPglite } from "../db";
import { emailAndPasswordEnabled } from "./email-password";
import { resendConfigured, sendEmail } from "../email/sender.server";
import { sendOtpMail, sendVerificationMail, sendWelcomeMail } from "../email/brand.server";
import { GATE_PROVIDER_ID, gateIdentitySessions } from "./gate-session.server";
import { captchaRequired, turnstileSecretKey } from "./turnstile.server";
import { GROK_PROVIDERS } from "./providers";
import { pgliteDialect } from "./pglite-dialect";
import { GROK_ISSUER_DEFAULT, PREVIEW_ALLOWED_HOSTS } from "./preview";
import {
  authDisabled,
  brokerEnabled,
  env,
  googleClientId,
  googleClientSecret,
  googleEnabled,
  grokClientId,
  grokClientSecret,
  signInEnabled,
} from "./status-core.server";

// Kick (and share) PGLite bootstrap as soon as the auth server module loads.
void ensureDbReady();

/**
 * Preview secret must outlive module reloads: PGLite (and its session rows) is
 * stored on `globalThis`, so an HMR re-eval of this file must NOT mint a new
 * signing secret or every existing session becomes invalid mid-dev. Process
 * restart clears both the secret and PGLite together.
 */
const globalAuthRef = globalThis as typeof globalThis & {
  __grokAuthPreviewSecret__?: string;
};
function previewAuthSecret(): string {
  globalAuthRef.__grokAuthPreviewSecret__ ??= randomBytes(32).toString("hex");
  return globalAuthRef.__grokAuthPreviewSecret__;
}

/** Read an env var, treating empty/whitespace as unset. */
// (the shared `env` probe lives in `./status-core.server`)

// Explicit off-switch, for a UI-only deploy: set `VITE_AUTH_ENABLED=false`.
// Anything else (including unset) means sign-in is live as soon as a provider
// has credentials — see `authConfigured` below. All provider probes live in
// `./status-core.server` so the sign-in screen reports exactly what this file
// builds.
//
// Direct Google OAuth (the path a normal host like Vercel uses). Better Auth
// owns the exchange and stores the Google email + name on the `user` row, so the
// storefront can read the visitor's address after sign-in.
//
// Broker federation creds. Unlike the sandbox preview, a deployed app must be
// issued its own client by the deployer — the baked preview client only accepts
// `*.grok-sandbox.com` callbacks, so on any other host it would dead-end the
// button. Therefore: no implicit fallback here, only an explicit injection.
const grokIssuer = env("GROK_AUTH_ISSUER") ?? GROK_ISSUER_DEFAULT;

/** True when federated sign-in is active (real auth is enforced). */
export const authConfigured = signInEnabled();

if (!authConfigured && !authDisabled) {
  console.warn(
    "[auth] No provider credentials found (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET" +
      " or GROK_AUTH_CLIENT_ID/GROK_AUTH_CLIENT_SECRET) — sign-in stays off and" +
      " requireUserId() falls back to the dev user.",
  );
}

// This app's own Better Auth origin. When deployed the deployer injects the
// public URL. In the sandbox live preview there's no fixed URL (each preview gets
// a dynamic `*.grok-sandbox.com` host), so we hand Better Auth a dynamic baseURL:
// it derives the origin per-request from the (proxied) host, validated against the
// preview allowlist, which makes the OAuth `redirect_uri` the concrete preview URL
// the broker's preview client accepts.
const explicitBaseURL =
  env("BETTER_AUTH_URL") ??
  // Vercel injects the production domain on every build, so a deploy needs no
  // hand-set BETTER_AUTH_URL; preview deploys still fall back to the wildcard.
  (env("VERCEL_PROJECT_PRODUCTION_URL")
    ? `https://${env("VERCEL_PROJECT_PRODUCTION_URL")}`
    : undefined);
// Explicit `string[]` (not a readonly tuple) — Better Auth's DynamicBaseURLConfig
// requires a mutable `allowedHosts: string[]`.
const previewAllowedHosts: string[] = [...PREVIEW_ALLOWED_HOSTS];
// Local `npm run dev` (port 8080 contract). Browsers may send Origin as any of
// these for the same server — trusting only `localhost` rejects `127.0.0.1` and
// breaks email/password with "Invalid origin".
const LOCAL_DEV_ORIGINS: string[] = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://[::1]:8080",
];
const baseURL = explicitBaseURL ?? {
  // Include loopback hosts so dynamic baseURL resolves for local email/password
  // (not only the preview wildcard).
  allowedHosts: [...previewAllowedHosts, "*.vercel.app", "localhost", "127.0.0.1", "[::1]"],
  // `auto` → trust both http:// and https:// expansions of allowedHosts
  // (preview is https; local dev is http).
  protocol: "auto" as const,
  fallback: "http://localhost:8080",
};

// Origins Better Auth accepts on credentialed POSTs (sign-up/sign-in, etc.).
// Missing entries here surface as FORBIDDEN "Invalid origin".
// `https://*.vercel.app` covers Vercel preview deploys, which get a distinct
// commit-hash host per deployment; the production host is pinned above.
const VERCEL_WILDCARDS: string[] = env("VERCEL") ? ["https://*.vercel.app", "*.vercel.app"] : [];
const trustedOrigins: string[] = explicitBaseURL
  ? [explicitBaseURL, ...VERCEL_WILDCARDS, ...LOCAL_DEV_ORIGINS]
  : [
      // Host wildcards (matched against Origin's host)
      ...previewAllowedHosts,
      // Full-origin wildcards (matched against Origin)
      ...previewAllowedHosts.flatMap((host) => [`https://${host}`, `http://${host}`]),
      ...LOCAL_DEV_ORIGINS,
    ];

const databaseUrl = env("DATABASE_URL");

// Static broker OAuth endpoints (skip OIDC discovery on every sign-in / callback).
// Discovery would cost an extra network hop to the broker before the popup can
// even redirect to Google/X — the live-preview popup felt stuck on the app for
// that whole round-trip. These paths match the broker's discovery document.
const issuerBase = grokIssuer.replace(/\/+$/, "");
const grokAuthorizationUrl = `${issuerBase}/api/auth/oauth2/authorize`;
const grokTokenUrl = `${issuerBase}/api/auth/oauth2/token`;
const grokUserInfoUrl = `${issuerBase}/api/auth/oauth2/userinfo`;

// Real Postgres when `DATABASE_URL` is set (deployed apps), else the app's
// embedded PGLite (preview) via a Kysely dialect — so Better Auth persists to the
// SAME DB as app data, including email/password users. Both use the Better Auth
// schema from `migrations/auth/0001_auth.sql`, copied into `migrations/` when
// the app turns sign-in on.
const database = databaseUrl
  ? new Pool({ connectionString: databaseUrl })
  : { dialect: pgliteDialect(() => getPglite()), type: "postgres" as const };

/** Session token cookie name — also read by the live-preview popup completion page. */
export const SESSION_TOKEN_COOKIE = "__Host-grok-auth.session_token";

/** How long a "confirm your account" link stays valid, in hours. */
const VERIFICATION_HOURS = 72;

/**
 * The confirmation code: six digits, ten minutes, five guesses.
 *
 * Ten minutes rather than the plugin's five-minute default because the customer
 * is switching windows, on a phone, often in one hand. Five attempts rather than
 * three because a mistyped digit is the normal case, and a code that locks on
 * the second try just produces resend requests. Brute force is not the threat a
 * six-digit address-confirmation code is defending against — someone else's
 * mailbox is.
 */
const OTP_LENGTH = 6;
const OTP_MINUTES = 10;
const OTP_ATTEMPTS = 5;

// Built separately so the `betterAuth({...})` call stays easy to edit without
// breaking brackets (models often trip on the conditional plugin spread).
const grokOAuthPlugin =
  authConfigured && brokerEnabled
    ? genericOAuth({
        config: GROK_PROVIDERS.map(({ providerId, idp }) => ({
          providerId,
          clientId: grokClientId as string,
          clientSecret: grokClientSecret as string,
          // Prefer static endpoints over `discoveryUrl` so initiating (and
          // completing) OAuth does not wait on a broker discovery fetch.
          authorizationUrl: grokAuthorizationUrl,
          tokenUrl: grokTokenUrl,
          userInfoUrl: grokUserInfoUrl,
          scopes: ["openid", "profile", "email"],
          // `prompt: "login"` forces the broker to re-authenticate against the
          // upstream on every sign-in instead of silently reusing an existing
          // broker session. Combined with the broker sending Google
          // `prompt=select_account`, the user always gets the account chooser
          // and can pick (or switch) which account to sign in with.
          authorizationUrlParams: { idp, prompt: "login" },
        })),
      })
    : null;

// Direct Google sign-in. Better Auth handles the exchange itself and writes the
// Google `email`/`name`/`picture` onto its user + account rows, so
// `useCurrentUser().primaryEmail` is the visitor's real Google address.
// Callback URL to whitelist in Google Cloud Console:
//   https://<your-host>/api/auth/callback/google   (plus the localhost one for dev)
const googleSocial = googleEnabled
  ? {
      google: {
        clientId: googleClientId as string,
        clientSecret: googleClientSecret as string,
        scope: ["openid", "email", "profile"],
        // Google's consent screen is configured for exactly these scopes; the
        // default extra scopes would trigger the unverified-app warning.
        disableDefaultScope: true,
      },
    }
  : undefined;

export const auth = betterAuth({
  baseURL,
  // Deployed apps inject BETTER_AUTH_SECRET. Preview: process-stable secret on
  // globalThis so HMR doesn't invalidate PGLite-backed sessions (see above).
  secret: env("BETTER_AUTH_SECRET") ?? previewAuthSecret(),
  database,

  // CSRF / origin check for credentialed auth POSTs (email sign-up/sign-in, …).
  // See `trustedOrigins` construction above — must cover live preview hosts AND
  // local loopback variants, or clients get "Invalid origin".
  trustedOrigins,

  // Encrypt broker-issued OAuth tokens at rest, and treat the broker's upstreams
  // as trusted first-party identities. The broker owns identity and X emails are
  // synthetic/unverified, so WITHOUT this a login can fail with
  // `account_not_linked` (Better Auth refuses to attach an untrusted, unverified
  // identity to an existing user). Google and X carry DISTINCT emails, so this
  // never merges them into one user — they stay separate identities.
  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      trustedProviders: [
        ...GROK_PROVIDERS.map((p) => p.providerId),
        GATE_PROVIDER_ID,
        // Direct Google is a first-party identity too, so a visitor who signed up
        // with email/password and then uses "Continue with Google" with the same
        // address lands on the same account instead of `account_not_linked`.
        ...(googleEnabled ? ["google"] : []),
      ],
      // X's synthetic email is never "verified", so don't gate linking on the
      // local user's email-verified state.
      requireLocalEmailVerified: false,
    },
  },

  // Google (and any broker upstream) as a native social provider.
  ...(googleSocial ? { socialProviders: googleSocial } : {}),

  // Route Better Auth's own mails (verify email, forget password) through Resend
  // when it is configured; otherwise it falls back to its built-in dev logger.
  ...(resendConfigured()
    ? {
        email: {
          sendEmail: async (data: {
            user: unknown;
            url: string;
            subject: string;
            text: string;
          }) => {
            // `user.email` is the only field we need; keep the import structural.
            const to = (data.user as { email?: string }).email;
            if (!to) return;
            const result = await sendEmail({
              to,
              subject: data.subject,
              // Resend renders both, so give it the plain body plus a link.
              html: `<p>${data.text.replace(/\n/g, "<br/>")}</p>`,
            });
            if (!result.ok) console.error("[auth] Resend mail failed:", result.error);
          },
        },
      }
    : {}),

  // Email verification for email/password sign-ups.
  //
  // The mechanism is now a typed code, not a link — see the `emailOTP` plugin
  // below. `sendOnSignUp` is off so that a new account gets exactly one mail
  // carrying one method; leaving it on would send a link and a code in the same
  // minute, and the customer would reasonably try both and wonder which broke.
  // The link route itself still exists and still works, so an older mail that a
  // customer already has is never stranded.
  //
  // We deliberately do NOT set `emailAndPassword.requireEmailVerification`: an
  // unverified address must not lock a customer out of an account they just made,
  // because delivery to a brand-new mailbox depends on the verified sender domain
  // being live. The dashboard gates on the flag in `verify-gate.ts` instead.
  emailVerification: {
    sendOnSignUp: false,
    expiresIn: VERIFICATION_HOURS * 60 * 60,
    sendVerificationEmail: async ({ user, url }) => {
      if (!resendConfigured()) {
        console.log(
          `[auth] Resend is not configured — verification link for ${user.email}: ${url}`,
        );
        return;
      }
      await sendVerificationMail({
        to: user.email,
        name: user.name,
        email: user.email,
        url,
        hours: VERIFICATION_HOURS,
      });
    },
  },

  // One welcome mail per new account — email/password or Google, since both
  // create a `user` row. Fire-and-forget: a bounced greeting must never fail a
  // sign-up.
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (!user.email) return;
          if (!resendConfigured()) {
            console.log(
              `[auth] Resend is not configured — skipping the welcome mail for ${user.email}`,
            );
            return;
          }
          await sendWelcomeMail({ to: user.email, name: user.name ?? "" });
        },
      },
    },
  },

  // Cache the session in the short-lived signed `session_data` cookie so reads
  // (incl. the client's `/get-session`) skip the DB — this shrinks the "loading"
  // window and reduces auth flicker. See the `auth` skill for the full
  // flicker-prevention guidance (gate on `isPending`; SSR the session).
  session: { cookieCache: { enabled: true, maxAge: 300 } },

  // Local email/password — toggled only via `./email-password` (not a plugin).
  ...(emailAndPasswordEnabled ? { emailAndPassword: { enabled: true } } : {}),

  // `__Host-` prefixed cookies: the browser REFUSES any same-named cookie that
  // carries a `Domain` attribute, so a sibling `*.grok.me` app cannot "toss" a
  // `Domain=.grok.me` session cookie onto this app. `__Host-` requires Secure +
  // Path=/ + no Domain; Better Auth otherwise uses `__Secure-` (which permits
  // Domain), so we drop its auto prefix (`useSecureCookies: false`) and set
  // Secure + the names ourselves. (Browsers allow Secure cookies on
  // `http://localhost`, so local dev still works.)
  advanced: {
    useSecureCookies: false,
    defaultCookieAttributes: { secure: true, sameSite: "lax", path: "/" },
    cookies: {
      session_token: { name: SESSION_TOKEN_COOKIE },
      session_data: { name: "__Host-grok-auth.session_data" },
      account_data: { name: "__Host-grok-auth.account_data" },
      dont_remember: { name: "__Host-grok-auth.dont_remember" },
    },
  },

  plugins: [
    gateIdentitySessions(),

    // One genericOAuth provider per upstream (when auth is on), all federating
    // to the broker with the SAME client and differing only by the `idp` hint.
    ...(grokOAuthPlugin ? [grokOAuthPlugin] : []),

    // Accept `Authorization: Bearer <session-token>` as an alternative to the
    // cookie. Needed for the LIVE PREVIEW: the app runs in an embedded iframe
    // where cookies are partitioned, so after popup sign-in it authenticates with
    // a bearer token instead (see `client.ts` / the `auth` skill). The hook only
    // fires when an Authorization header is present, so the cookie path
    // (deployed apps) is unaffected.
    bearer(),

    // Cloudflare Turnstile, when this deploy has BOTH keys. Better Auth's plugin
    // intercepts `/sign-up/email`, `/sign-in/email` and `/request-password-reset`
    // and requires an `x-captcha-response` header it verifies against
    // Cloudflare — so the check is enforced at the endpoint, not merely hidden in
    // the UI. Absent either key, these endpoints stay open exactly as before:
    // enforcing on the secret alone would lock the form behind a widget the
    // browser was never given a site key to render.
    ...(captchaRequired()
      ? [
          captcha({
            provider: "cloudflare-turnstile",
            secretKey: turnstileSecretKey() as string,
          }),
        ]
      : []),

    // Confirmation by typed code rather than by link. Adds
    // `/email-otp/send-verification-otp` and `/email-otp/verify-email`; the
    // second one flips `emailVerified` on the user row, which is what the
    // dashboard gate reads.
    //
    // `storeOTP: "hashed"` because the codes land in the same Postgres as every
    // password — a plaintext column there would turn a database leak into an
    // account-takeover kit, for no gain. Hashing means a resend always mints a
    // fresh code instead of repeating the old one, which is the safer default
    // anyway.
    emailOTP({
      otpLength: OTP_LENGTH,
      expiresIn: OTP_MINUTES * 60,
      allowedAttempts: OTP_ATTEMPTS,
      storeOTP: "hashed",
      sendVerificationOnSignUp: true,
      async sendVerificationOTP(data) {
        if (!resendConfigured()) {
          // Same escape hatch as the other mails: with no sender configured the
          // code is logged rather than sent, so local development can still
          // complete a sign-up. Never reachable in production, where the key is
          // set — and note that this logs a live code, which is why it is gated.
          console.log(`[auth] Resend is not configured — code for ${data.email}: ${data.otp}`);
          return;
        }
        await sendOtpMail({
          to: data.email,
          otp: data.otp,
          type: data.type,
          minutes: OTP_MINUTES,
        });
      },
    }),

    // Bridges Better Auth's Set-Cookie into TanStack Start responses. MUST be
    // last so it runs after every other plugin's hooks.
    tanstackStartCookies(),
  ],
});

export function readSessionToken(): string | null {
  return getCookie(SESSION_TOKEN_COOKIE) ?? null;
}

// Re-exported for convenience; the array lives in the dependency-free
// `providers.ts` so the client can import it too.
export { GROK_PROVIDERS } from "./providers";
