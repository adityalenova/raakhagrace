import { createServerFn } from "@tanstack/react-start";

/**
 * Server functions that answer "who is allowed to be here", callable from routes.
 *
 * The implementations live in `*.server.ts` modules and are imported lazily
 * inside each handler, because TanStack Start's import protection rejects a
 * client-side route that statically imports a `*.server.*` file. Return types
 * are inferred through the dynamic import, so no server type crosses the wire.
 */

/** Admin gate state for `/admin`: allowlisted Google address, or a prompt. */
export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { adminStatusForRequest } = await import("./admin.server");
  return adminStatusForRequest();
});

/** Which sign-in providers this deployment has credentials for. */
export const getSignInStatus = createServerFn({ method: "GET" }).handler(async () => {
  const m = await import("./auth/status-core.server");
  return {
    /** Master switch off (`VITE_AUTH_ENABLED=false`) — show no providers. */
    enabled: m.signInEnabled(),
    google: m.googleEnabled,
    broker: m.brokerEnabled,
    emailPassword: m.emailPasswordEnabled(),
  };
});
