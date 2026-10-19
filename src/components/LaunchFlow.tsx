import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { LotusMark } from "./LotusMark";

type Phase = "welcome" | "done";

function readPhase(): Phase {
  if (typeof window === "undefined") return "done";
  try {
    if (sessionStorage.getItem("rg-welcome") === "1") return "done";
  } catch {
    return "done";
  }
  return "welcome";
}

function safeSet(key: string) {
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    /* ignore */
  }
}

/**
 * Welcome card only — no full-screen blue lotus intro.
 * Shows once per browser session; Esc / X / Begin exploring dismisses.
 */
export function LaunchFlow() {
  const [phase, setPhase] = useState<Phase>("done");

  useEffect(() => {
    setPhase(readPhase());
  }, []);

  // Auto-dismiss after a few seconds so pages are never stuck
  useEffect(() => {
    if (phase !== "welcome") return;
    const t = window.setTimeout(() => {
      safeSet("rg-welcome");
      setPhase("done");
    }, 6000);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "done") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        safeSet("rg-welcome");
        setPhase("done");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  function finish() {
    safeSet("rg-welcome");
    setPhase("done");
  }

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-fg/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Raakha Grace"
      onClick={finish}
    >
      <div
        className="relative w-full max-w-md rounded-xl bg-surface p-8 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-3 top-3 grid h-11 w-11 place-items-center text-muted"
          aria-label="Close welcome"
          onClick={finish}
        >
          <X className="h-5 w-5" />
        </button>
        <LotusMark className="mx-auto h-10 w-10 text-[#1A1714]" />
        <h2 className="mt-4 font-display text-3xl">Welcome to Raakha Grace</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Handmade jewellery, light on the skin and meant for every occasion.
          Enjoy complimentary gift wrapping on your first order.
        </p>
        <button
          type="button"
          className="mt-6 h-12 w-full rounded-md bg-fg text-sm tracking-[0.16em] text-bg uppercase"
          onClick={finish}
        >
          Begin exploring
        </button>
      </div>
    </div>
  );
}
