import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { auth } = await import("@/lib/auth/server");
          return auth.handler(request);
        } catch (e) {
          console.error("[auth] GET failed", e);
          return new Response(JSON.stringify({ error: true, message: "Auth unavailable" }), {
            status: 503,
            headers: { "content-type": "application/json" },
          });
        }
      },
      POST: async ({ request }) => {
        try {
          const { auth } = await import("@/lib/auth/server");
          return auth.handler(request);
        } catch (e) {
          console.error("[auth] POST failed", e);
          return new Response(JSON.stringify({ error: true, message: "Auth unavailable" }), {
            status: 503,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
