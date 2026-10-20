import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

const APP_NAME = "Raakha Grace";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content: "Raakha Grace — handmade jewellery, light enough for every occasion.",
      },
      { name: "theme-color", content: "#FFF3EC" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Raakha Grace" },
      { name: "mobile-web-app-capable", content: "yes" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      // Fonts are self-hosted @font-face in styles.css (see there for why).
      // Only the two faces above the fold are preloaded; the rest arrive
      // lazily with `font-display: swap`, so text is never held up.
      {
        rel: "preload",
        href: "/fonts/outfit-latin-400-normal.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: "/fonts/cormorant-garamond-latin-500-normal.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
    ],
  }),
  component: () => (
    <html
      lang="en"
      className="antialiased"
      style={{ backgroundColor: "#FFF3EC" }}
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg" style={{ backgroundColor: "#FFF3EC", margin: 0 }}>
        <PreviewHostBridge />
        {/*
          Page-view counting for the atelier (see /cookie-information for what it
          writes and /data-protection for the basis). The component only injects
          inside an effect, so it renders nothing on the server and cannot shift
          the markup the client hydrates against.
        */}
        <Analytics />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
