import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * The cookie policy grew into a full inventory — every cookie and storage key by
 * name — and lives at `/cookie-information` now. This route stays as a redirect
 * so the old link in the footer, the chat answers and any saved bookmark all land
 * on the same page instead of two documents that can drift apart.
 */
export const Route = createFileRoute("/cookies")({
  beforeLoad: () => {
    throw redirect({ to: "/cookie-information" });
  },
  component: () => null,
});
