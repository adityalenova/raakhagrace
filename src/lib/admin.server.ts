import { getSessionUser, UnauthorizedError } from "./auth/verify.server";
import { adminEmails } from "./email/sender.server";

/**
 * Atelier admin access — server-side, keyed on the signed-in Google address.
 *
 * Replaces the old client-side `admin-session.ts`, which compared a hardcoded
 * email and password inside the browser bundle (so the password shipped in
 * public source and anyone could read it). Here the decision is made on the
 * server from the verified Better Auth session, and the allowlist lives in the
 * `ADMIN_EMAILS` env var, not in code.
 *
 * Scope note: the product editor writes to a browser-local catalog store, so a
 * passing `allowed` grants access to this admin *screen*, not to server data.
 */

export type AdminStatus = {
  /** True when a signed-in session's email is on the `ADMIN_EMAILS` allowlist. */
  allowed: boolean;
  /** The signed-in address, so the UI can explain what to change. */
  email: string | null;
  /** Whether any allowlist is configured at all. */
  configured: boolean;
};

function isAllowedEmail(email: string | null | undefined): boolean {
  const list = adminEmails();
  if (!email || list.length === 0) return false;
  return list.includes(email.trim().toLowerCase());
}

/**
 * Evaluate admin access for the current request. Never throws — the callable
 * wrapper in `@/lib/admin` turns this into a server function, and the UI renders
 * a sign-in prompt from the result.
 */
export async function adminStatusForRequest(): Promise<AdminStatus> {
  const user = await getSessionUser();
  return {
    allowed: isAllowedEmail(user?.email),
    email: user?.email ?? null,
    configured: adminEmails().length > 0,
  };
}

/**
 * Guard for admin-only server functions. Throws `UnauthorizedError` (401) for
 * signed-out callers and `Error` (403) for signed-in non-admins, so a future
 * server-side mutation can be protected with one call.
 */
export async function requireAdmin(): Promise<{ id: string; email: string }> {
  const user = await getSessionUser();
  if (!user) throw new UnauthorizedError();
  if (!isAllowedEmail(user.email)) {
    throw new Error(`Forbidden: ${user.email ?? "unknown"} is not on ADMIN_EMAILS`);
  }
  return { id: user.id, email: user.email as string };
}
