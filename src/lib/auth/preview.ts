/**
 * Broker constants for the sandbox live preview.
 *
 * The shared preview OAuth client used to be baked in here so a `*.grok-sandbox.com`
 * preview could sign in with no platform injection. It is gone: this app deploys
 * to a normal host, where a baked-in shared client id/secret in public source is a
 * liability, and a client that only accepts `*.grok-sandbox.com` callbacks could
 * never complete a sign-in here anyway. Broker federation now requires the
 * deployer to inject `GROK_AUTH_CLIENT_ID` / `GROK_AUTH_CLIENT_SECRET` (see
 * `server.ts`); direct Google OAuth is the path this deployment uses.
 */

/** The shared auth broker issuer (OIDC discovery lives under it). */
export const GROK_ISSUER_DEFAULT = "https://auth.grok.me";

/**
 * Host patterns whose callbacks the preview client accepts. Better Auth derives
 * the live preview's real origin from the request host and validates it against
 * this list (wildcard-matched), so the OAuth `redirect_uri` becomes the concrete
 * `https://<preview-host>/api/auth/oauth2/callback/...` the broker allows.
 */
export const PREVIEW_ALLOWED_HOSTS = ["*.grok-sandbox.com"] as const;
