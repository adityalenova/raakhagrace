import { useEffect, useRef } from "react";
import { TURNSTILE_SITE_KEY } from "@/lib/auth/turnstile";

/**
 * Cloudflare's "Verify you are human" box, in explicit-render mode.
 *
 * Explicit render rather than the auto-render `onload` callback because this
 * form swaps between sign-in and sign-up and the widget has to survive a
 * re-mount without stacking a second challenge on top of the first.
 *
 * The token is short-lived, so `expired-callback` clears it — a stale token
 * fails server-side verification, and the last thing we want is a form that
 * looks solved but submits a dead one.
 */

interface TurnstileWidget {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      action?: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
  remove: (id: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileWidget;
  }
}

const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/** Resolves once Cloudflare's global exists; reuses an in-flight load. */
function loadTurnstile(): Promise<TurnstileWidget> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src^="${SRC}"]`);
    const script = existing ?? document.createElement("script");
    const done = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error("Turnstile loaded without registering"));
    };
    if (window.turnstile) {
      done();
      return;
    }
    script.addEventListener("load", done, { once: true });
    script.addEventListener("error", () => reject(new Error("Turnstile failed to load")), {
      once: true,
    });
    if (!existing) {
      script.src = SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

export function Turnstile({
  onToken,
  onError,
}: {
  /** Called with the solved token, and again with "" when it expires. */
  onToken: (token: string) => void;
  onError?: () => void;
}) {
  const host = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sitekey = TURNSTILE_SITE_KEY;
    const el = host.current;
    if (!sitekey || !el) return;

    let widgetId: string | null = null;
    let cancelled = false;

    loadTurnstile()
      .then((turnstile) => {
        // The effect can resolve after the form has already unmounted (mode
        // toggle, or a redirect from a successful submit).
        if (cancelled || !host.current) return;
        widgetId = turnstile.render(host.current, {
          sitekey,
          theme: "light",
          action: "raakha-auth",
          callback: onToken,
          "expired-callback": () => onToken(""),
          "error-callback": () => {
            onToken("");
            onError?.();
          },
        });
      })
      .catch(() => {
        if (!cancelled) onError?.();
      });

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          /* already gone */
        }
      }
    };
  }, [onToken, onError]);

  if (!TURNSTILE_SITE_KEY) return null;

  return <div ref={host} className="flex min-h-[66px] items-center" />;
}
